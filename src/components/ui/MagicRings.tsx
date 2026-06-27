// ponytail: Three.js animated rings — independent renderer per instance, mounts/unmounts with theme
import { useRef, useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'
import * as THREE from 'three'

export interface MagicRingsProps {
  color?: string
  colorTwo?: string
  speed?: number
  ringCount?: number
  attenuation?: number
  lineThickness?: number
  baseRadius?: number
  radiusStep?: number
  scaleRate?: number
  opacity?: number
  blur?: number
  noiseAmount?: number
  rotation?: number
  ringGap?: number
  fadeIn?: number
  fadeOut?: number
  className?: string
}

function isWebGL2Supported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

function ringFragmentShader(
  color: string,
  colorTwo: string,
  opacity: number,
  noiseAmount: number,
) {
  // Precompute RGB components from hex in JS (GLSL ES has no string type)
  const r1 = parseInt(color.slice(1, 3), 16) / 255
  const g1 = parseInt(color.slice(3, 5), 16) / 255
  const b1 = parseInt(color.slice(5, 7), 16) / 255
  const r2 = parseInt(colorTwo.slice(1, 3), 16) / 255
  const g2 = parseInt(colorTwo.slice(3, 5), 16) / 255
  const b2 = parseInt(colorTwo.slice(5, 7), 16) / 255

  return `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uHover;
    varying vec2 vUv;

    const vec3 c1 = vec3(${r1.toFixed(6)}, ${g1.toFixed(6)}, ${b1.toFixed(6)});
    const vec3 c2 = vec3(${r2.toFixed(6)}, ${g2.toFixed(6)}, ${b2.toFixed(6)});

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec3 color = mix(c1, c2, sin(uTime * 0.5) * 0.5 + 0.5);

      float noise = hash(vUv + uTime * 0.1) * ${noiseAmount.toFixed(2)};
      float alpha = ${opacity.toFixed(2)} - noise;

      vec2 mouseOffset = (uMouse - 0.5) * 0.1 * uHover;
      float dist = length(vUv - 0.5 - mouseOffset);
      alpha *= smoothstep(0.5, 0.0, dist);

      gl_FragColor = vec4(color, alpha);
    }
  `
}

export function MagicRings({
  color = '#fc42ff',
  colorTwo = '#42fcff',
  speed = 1,
  ringCount = 6,
  attenuation = 10,
  lineThickness = 2,
  baseRadius = 0.35,
  radiusStep = 0.1,
  scaleRate = 0.1,
  opacity = 1,
  blur = 0,
  noiseAmount = 0.1,
  rotation = 0,
  ringGap = 1.5,
  className,
}: MagicRingsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer | null
    scene: THREE.Scene | null
    camera: THREE.PerspectiveCamera | null
    animId: number
    rings: THREE.Mesh[]
    startTime: number
  }>({
    renderer: null,
    scene: null,
    camera: null,
    animId: 0,
    rings: [],
    startTime: 0,
  })

  useEffect(() => {
    if (theme !== 'dark') return
    if (!isWebGL2Supported()) return

    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 300
    const height = container.clientHeight || 300

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.z = 1.5

    // Uniforms
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
    }

    // Create rings
    const rings: THREE.Mesh[] = []
    for (let i = 0; i < ringCount; i++) {
      const r = baseRadius + i * radiusStep * ringGap
      const geometry = new THREE.RingGeometry(r, r + lineThickness * 0.01, 64)

      const material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(uniforms),
        vertexShader,
        fragmentShader: ringFragmentShader(color, colorTwo, Math.max(0.001, opacity - i * (attenuation / 100)), noiseAmount),
        transparent: true,
        side: THREE.DoubleSide,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.x = Math.PI / 2 + rotation
      mesh.position.z = -i * 0.05

      const scale = 1 - i * scaleRate
      mesh.scale.set(scale, scale, scale)

      scene.add(mesh)
      rings.push(mesh)
    }

    const startTime = performance.now()
    const ctx = { renderer, scene, camera, animId: 0, rings, startTime }

    // Animation loop
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000
      uniforms.uTime.value = elapsed * speed

      rings.forEach((ring, i) => {
        const shader = ring.material as THREE.ShaderMaterial
        shader.uniforms.uTime.value = elapsed * speed * (1 + i * 0.1)
        ring.rotation.z = elapsed * speed * 0.1 * (i % 2 === 0 ? 1 : -1)
      })

      renderer.render(scene, camera)
      ctx.animId = requestAnimationFrame(animate)
    }
    ctx.animId = requestAnimationFrame(animate)

    sceneRef.current = ctx

    return () => {
      cancelAnimationFrame(ctx.animId)
      rings.forEach(ring => {
        ring.geometry.dispose()
        ;(ring.material as THREE.ShaderMaterial).dispose()
      })
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss?.()
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [theme, color, colorTwo, speed, ringCount, attenuation, lineThickness, baseRadius, radiusStep, scaleRate, opacity, noiseAmount, rotation, ringGap])

  if (theme !== 'dark') return null

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      aria-hidden="true"
      style={{ filter: blur > 0 ? `blur(${blur}px)` : undefined }}
    />
  )
}