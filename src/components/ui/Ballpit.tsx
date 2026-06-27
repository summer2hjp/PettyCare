import { useEffect, useRef } from 'react';
import {
  Vector3,
  MeshPhysicalMaterial,
  InstancedMesh,
  Timer,
  AmbientLight,
  SphereGeometry,
  ShaderChunk,
  Scene,
  Color,
  Object3D,
  SRGBColorSpace,
  MathUtils,
  PMREMGenerator,
  Vector2,
  WebGLRenderer,
  PerspectiveCamera,
  PointLight,
  ACESFilmicToneMapping,
  Plane,
  Raycaster,
  type WebGLRendererParameters,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// ── ThreeEngine ──────────────────────────────────────────────────────────
interface ThreeEngineOptions {
  canvas?: HTMLCanvasElement
  id?: string
  size?: 'parent' | { width: number; height: number }
  rendererOptions?: WebGLRendererParameters
}

interface ThreeEngineSize {
  width: number
  height: number
  wWidth: number
  wHeight: number
  ratio: number
  pixelRatio: number
}

interface TimeInfo {
  elapsed: number
  delta: number
}

class ThreeEngine {
  #options: ThreeEngineOptions
  canvas!: HTMLCanvasElement
  camera!: PerspectiveCamera
  cameraMinAspect?: number
  cameraMaxAspect?: number
  cameraFov!: number
  maxPixelRatio?: number
  minPixelRatio?: number
  scene!: Scene
  renderer!: WebGLRenderer
  #postprocessing: { render: () => void; setSize: (w: number, h: number) => void; dispose: () => void } | null = null
  size: ThreeEngineSize = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 }
  render = this.#render.bind(this)
  onBeforeRender: (time: TimeInfo) => void = () => {}
  onAfterRender: (time: TimeInfo) => void = () => {}
  onAfterResize: (size: ThreeEngineSize) => void = () => {}
  #visible = false
  #animating = false
  isDisposed = false
  #resizeObserver: ResizeObserver | null = null
  #intersectionObserver: IntersectionObserver | null = null
  #resizeTimer: ReturnType<typeof setTimeout> | null = null
  #timer = new Timer()
  #time: TimeInfo = { elapsed: 0, delta: 0 }
  #animFrameId = 0

  constructor(options: ThreeEngineOptions) {
    this.#options = { ...options }
    this.#initCamera()
    this.#initScene()
    this.#initRenderer()
    this.resize()
    this.#initObservers()
  }

  #initCamera() {
    this.camera = new PerspectiveCamera()
    this.cameraFov = this.camera.fov
  }

  #initScene() {
    this.scene = new Scene()
  }

  #initRenderer() {
    if (this.#options.canvas) {
      this.canvas = this.#options.canvas
    } else if (this.#options.id) {
      this.canvas = document.getElementById(this.#options.id) as HTMLCanvasElement
    } else {
      console.error('Three: Missing canvas or id parameter')
    }
    this.canvas.style.display = 'block'
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      powerPreference: 'high-performance',
      ...(this.#options.rendererOptions ?? {}),
    })
    this.renderer.outputColorSpace = SRGBColorSpace
  }

  #initObservers() {
    if (!(this.#options.size instanceof Object)) {
      window.addEventListener('resize', this.#debouncedResize.bind(this))
      if (this.#options.size === 'parent' && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#debouncedResize.bind(this))
        this.#resizeObserver.observe(this.canvas.parentNode as Element)
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#onVisibilityChange.bind(this), {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    })
    this.#intersectionObserver.observe(this.canvas)
    document.addEventListener('visibilitychange', this.#onPageVisibility.bind(this))
  }

  #removeObservers() {
    window.removeEventListener('resize', this.#debouncedResize.bind(this))
    this.#resizeObserver?.disconnect()
    this.#intersectionObserver?.disconnect()
    document.removeEventListener('visibilitychange', this.#onPageVisibility.bind(this))
  }

  #onVisibilityChange(entries: IntersectionObserverEntry[]) {
    this.#visible = entries[0].isIntersecting
    this.#visible ? this.#start() : this.#stop()
  }

  #onPageVisibility() {
    if (this.#visible) {
      document.hidden ? this.#stop() : this.#start()
    }
  }

  #debouncedResize() {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer)
    this.#resizeTimer = setTimeout(this.resize.bind(this), 100)
  }

  resize() {
    let width: number, height: number
    if (this.#options.size instanceof Object) {
      width = this.#options.size.width
      height = this.#options.size.height
    } else if (this.#options.size === 'parent' && this.canvas.parentNode) {
      const parent = this.canvas.parentNode as HTMLElement
      width = parent.offsetWidth
      height = parent.offsetHeight
    } else {
      width = window.innerWidth
      height = window.innerHeight
    }
    this.size.width = width
    this.size.height = height
    this.size.ratio = width / height
    this.#updateCamera()
    this.#updateRendererSize()
    this.onAfterResize(this.size)
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFovForAspect(this.cameraMinAspect)
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFovForAspect(this.cameraMaxAspect)
      } else {
        this.camera.fov = this.cameraFov
      }
    }
    this.camera.updateProjectionMatrix()
    this.updateWorldSize()
  }

  #adjustFovForAspect(aspect: number) {
    const halfFovTan = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / aspect)
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(halfFovTan))
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180
      this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length()
      this.size.wWidth = this.size.wHeight * this.camera.aspect
    } else {
      this.size.wHeight = (this.camera as unknown as { top: number; bottom: number }).top -
        (this.camera as unknown as { top: number; bottom: number }).bottom
      this.size.wWidth = (this.camera as unknown as { right: number; left: number }).right -
        (this.camera as unknown as { right: number; left: number }).left
    }
  }

  #updateRendererSize() {
    this.renderer.setSize(this.size.width, this.size.height)
    this.#postprocessing?.setSize(this.size.width, this.size.height)
    let pixelRatio = window.devicePixelRatio
    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) pixelRatio = this.maxPixelRatio
    else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) pixelRatio = this.minPixelRatio
    this.renderer.setPixelRatio(pixelRatio)
    this.size.pixelRatio = pixelRatio
  }

  get postprocessing() { return this.#postprocessing }
  set postprocessing(pp) {
    if (!pp) return
    this.#postprocessing = pp
    this.render = pp.render.bind(pp)
  }

  #start() {
    if (this.#animating) return
    const animate = (_time: number) => {
      this.#animFrameId = requestAnimationFrame(animate)
      this.#timer.update()
      this.#time.delta = this.#timer.getDelta()
      this.#time.elapsed += this.#time.delta
      this.onBeforeRender(this.#time)
      this.render()
      this.onAfterRender(this.#time)
    }
    this.#animating = true
    this.#timer.reset()
    animate(0)
  }

  #stop() {
    if (this.#animating) {
      cancelAnimationFrame(this.#animFrameId)
      this.#animating = false
    }
  }

  #render() {
    this.renderer.render(this.scene, this.camera)
  }

  clear() {
    this.scene.traverse(obj => {
      const mesh = obj as unknown as { isMesh?: boolean; material?: MeshPhysicalMaterial; geometry?: SphereGeometry }
      if (mesh.isMesh && mesh.material) {
        if (mesh.material.map) mesh.material.map.dispose()
        if (mesh.material.envMap) mesh.material.envMap.dispose()
        mesh.material.dispose()
        mesh.geometry?.dispose()
      }
    })
    this.scene.clear()
  }

  dispose() {
    this.#removeObservers()
    this.#stop()
    this.#timer.dispose()
    this.clear()
    this.#postprocessing?.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.isDisposed = true
  }
}

// ── Pointer tracking ─────────────────────────────────────────────────────
interface PointerTrackerConfig {
  domElement: HTMLElement
  position: Vector2
  nPosition: Vector2
  hover: boolean
  touching: boolean
  onEnter: (t: PointerTrackerConfig) => void
  onMove: (t: PointerTrackerConfig) => void
  onClick: (t: PointerTrackerConfig) => void
  onLeave: (t: PointerTrackerConfig) => void
  dispose: () => void
}

const _trackers = new Map<HTMLElement, PointerTrackerConfig>()
const _pointer = new Vector2()
let _listening = false

function createPointerTracker(el: HTMLElement, overrides: Partial<PointerTrackerConfig> = {}): PointerTrackerConfig {
  const tracker: PointerTrackerConfig = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter() {},
    onMove() {},
    onClick() {},
    onLeave() {},
    dispose: () => {},
    ...overrides,
    domElement: el,
  }

  if (!_trackers.has(el)) {
    _trackers.set(el, tracker)
    if (!_listening) {
      document.body.addEventListener('pointermove', onPointerMove)
      document.body.addEventListener('pointerleave', onPointerLeave)
      document.body.addEventListener('click', onPointerClick)
      document.body.addEventListener('touchstart', onTouchStart, { passive: false })
      document.body.addEventListener('touchmove', onTouchMove, { passive: false })
      document.body.addEventListener('touchend', onTouchEnd, { passive: false })
      document.body.addEventListener('touchcancel', onTouchEnd, { passive: false })
      _listening = true
    }
  }

  tracker.dispose = () => {
    _trackers.delete(el)
    if (_trackers.size === 0) {
      document.body.removeEventListener('pointermove', onPointerMove)
      document.body.removeEventListener('pointerleave', onPointerLeave)
      document.body.removeEventListener('click', onPointerClick)
      document.body.removeEventListener('touchstart', onTouchStart)
      document.body.removeEventListener('touchmove', onTouchMove)
      document.body.removeEventListener('touchend', onTouchEnd)
      document.body.removeEventListener('touchcancel', onTouchEnd)
      _listening = false
    }
  }

  return tracker
}

function onPointerMove(e: PointerEvent) {
  _pointer.x = e.clientX
  _pointer.y = e.clientY
  processTrackers()
}

function processTrackers() {
  for (const [el, t] of _trackers) {
    const rect = el.getBoundingClientRect()
    if (isInsideRect(rect)) {
      updateTrackerPosition(t, rect)
      if (!t.hover) { t.hover = true; t.onEnter(t) }
      t.onMove(t)
    } else if (t.hover && !t.touching) {
      t.hover = false; t.onLeave(t)
    }
  }
}

function onPointerClick(e: PointerEvent) {
  _pointer.x = e.clientX
  _pointer.y = e.clientY
  for (const [el, t] of _trackers) {
    const rect = el.getBoundingClientRect()
    updateTrackerPosition(t, rect)
    if (isInsideRect(rect)) t.onClick(t)
  }
}

function onPointerLeave() {
  for (const t of _trackers.values()) {
    if (t.hover) { t.hover = false; t.onLeave(t) }
  }
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault()
    _pointer.x = e.touches[0].clientX
    _pointer.y = e.touches[0].clientY
    for (const [el, t] of _trackers) {
      const rect = el.getBoundingClientRect()
      if (isInsideRect(rect)) {
        t.touching = true
        updateTrackerPosition(t, rect)
        if (!t.hover) { t.hover = true; t.onEnter(t) }
        t.onMove(t)
      }
    }
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault()
    _pointer.x = e.touches[0].clientX
    _pointer.y = e.touches[0].clientY
    for (const [el, t] of _trackers) {
      const rect = el.getBoundingClientRect()
      updateTrackerPosition(t, rect)
      if (isInsideRect(rect)) {
        if (!t.hover) { t.hover = true; t.touching = true; t.onEnter(t) }
        t.onMove(t)
      } else if (t.hover && t.touching) {
        t.onMove(t)
      }
    }
  }
}

function onTouchEnd() {
  for (const [, t] of _trackers) {
    if (t.touching) {
      t.touching = false
      if (t.hover) { t.hover = false; t.onLeave(t) }
    }
  }
}

function updateTrackerPosition(t: PointerTrackerConfig, rect: DOMRect) {
  t.position.x = _pointer.x - rect.left
  t.position.y = _pointer.y - rect.top
  t.nPosition.x = (t.position.x / rect.width) * 2 - 1
  t.nPosition.y = (-t.position.y / rect.height) * 2 + 1
}

function isInsideRect(rect: DOMRect) {
  return _pointer.x >= rect.left && _pointer.x <= rect.left + rect.width &&
         _pointer.y >= rect.top && _pointer.y <= rect.top + rect.height
}

// ── Physics particle system ──────────────────────────────────────────────
const _vA = new Vector3()
const _vB = new Vector3()
const _vC = new Vector3()
const _vD = new Vector3()
const _vE = new Vector3()
const _vF = new Vector3()
const _vG = new Vector3()
const _vH = new Vector3()
const _vI = new Vector3()
const _vJ = new Vector3()

interface PhysicsConfig {
  count: number
  maxX: number
  maxY: number
  maxZ: number
  minSize: number
  maxSize: number
  size0: number
  gravity: number
  friction: number
  wallBounce: number
  maxVelocity: number
  controlSphere0: boolean
}

class PhysicsSystem {
  config: PhysicsConfig
  positionData: Float32Array
  velocityData: Float32Array
  sizeData: Float32Array
  center: Vector3

  constructor(config: PhysicsConfig) {
    this.config = config
    this.positionData = new Float32Array(3 * config.count).fill(0)
    this.velocityData = new Float32Array(3 * config.count).fill(0)
    this.sizeData = new Float32Array(config.count).fill(1)
    this.center = new Vector3()
    this.#initPositions()
    this.setSizes()
  }

  #initPositions() {
    const { config, positionData } = this
    this.center.toArray(positionData, 0)
    for (let i = 1; i < config.count; i++) {
      const base = 3 * i
      positionData[base] = MathUtils.randFloatSpread(2 * config.maxX)
      positionData[base + 1] = MathUtils.randFloatSpread(2 * config.maxY)
      positionData[base + 2] = MathUtils.randFloatSpread(2 * config.maxZ)
    }
  }

  setSizes() {
    const { config, sizeData } = this
    sizeData[0] = config.size0
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize)
    }
  }

  update(time: TimeInfo) {
    const { config, center, positionData, sizeData, velocityData } = this
    let startIdx = 0
    if (config.controlSphere0) {
      startIdx = 1
      _vA.fromArray(positionData, 0)
      _vA.lerp(center, 0.1).toArray(positionData, 0)
      _vD.set(0, 0, 0).toArray(velocityData, 0)
    }

    // Apply gravity + friction
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx
      _vB.fromArray(positionData, base)
      _vE.fromArray(velocityData, base)
      _vE.y -= time.delta * config.gravity * sizeData[idx]
      _vE.multiplyScalar(config.friction)
      _vE.clampLength(0, config.maxVelocity)
      _vB.add(_vE)
      _vB.toArray(positionData, base)
      _vE.toArray(velocityData, base)
    }

    // Collision detection
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx
      _vB.fromArray(positionData, base)
      _vE.fromArray(velocityData, base)
      const radius = sizeData[idx]

      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx
        _vC.fromArray(positionData, otherBase)
        _vF.fromArray(velocityData, otherBase)
        const otherRadius = sizeData[jdx]

        _vG.copy(_vC).sub(_vB)
        const dist = _vG.length()
        const sumRadius = radius + otherRadius

        if (dist < sumRadius) {
          const overlap = sumRadius - dist
          _vH.copy(_vG).normalize().multiplyScalar(0.5 * overlap)
          _vI.copy(_vH).multiplyScalar(Math.max(_vE.length(), 1))
          _vJ.copy(_vH).multiplyScalar(Math.max(_vF.length(), 1))
          _vB.sub(_vH)
          _vE.sub(_vI)
          _vB.toArray(positionData, base)
          _vE.toArray(velocityData, base)
          _vC.add(_vH)
          _vF.add(_vJ)
          _vC.toArray(positionData, otherBase)
          _vF.toArray(velocityData, otherBase)
        }
      }

      // Collision with control sphere
      if (config.controlSphere0) {
        _vG.copy(_vA).sub(_vB)
        const dist = _vG.length()
        const sumRadius0 = radius + sizeData[0]
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist
          _vH.copy(_vG.normalize()).multiplyScalar(diff)
          _vI.copy(_vH).multiplyScalar(Math.max(_vE.length(), 2))
          _vB.sub(_vH)
          _vE.sub(_vI)
        }
      }

      // Wall bounce
      if (Math.abs(_vB.x) + radius > config.maxX) {
        _vB.x = Math.sign(_vB.x) * (config.maxX - radius)
        _vE.x = -_vE.x * config.wallBounce
      }
      if (config.gravity === 0) {
        if (Math.abs(_vB.y) + radius > config.maxY) {
          _vB.y = Math.sign(_vB.y) * (config.maxY - radius)
          _vE.y = -_vE.y * config.wallBounce
        }
      } else if (_vB.y - radius < -config.maxY) {
        _vB.y = -config.maxY + radius
        _vE.y = -_vE.y * config.wallBounce
      }
      const maxBoundary = Math.max(config.maxZ, config.maxSize)
      if (Math.abs(_vB.z) + radius > maxBoundary) {
        _vB.z = Math.sign(_vB.z) * (config.maxZ - radius)
        _vE.z = -_vE.z * config.wallBounce
      }

      _vB.toArray(positionData, base)
      _vE.toArray(velocityData, base)
    }
  }
}

// ── Custom material with subsurface scattering ───────────────────────────
class BallMaterial extends MeshPhysicalMaterial {
  uniforms: Record<string, { value: unknown }>
  onBeforeCompile2?: (shader: { fragmentShader: string }) => void

  constructor(params: Record<string, unknown> = {}) {
    super(params)
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 },
    }
    this.defines = { ...this.defines, USE_UV: '' }
    this.onBeforeCompile = (shader: { uniforms: Record<string, { value: unknown }>; fragmentShader: string }) => {
      Object.assign(shader.uniforms, this.uniforms)
      shader.fragmentShader =
        '\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      ' +
        shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        '\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      ',
      )
      const lightsBegin = ShaderChunk.lights_fragment_begin.replace(
        /RE_Direct\(\s*directLight,\s*geometryPosition,\s*geometryNormal,\s*geometryViewDir,\s*geometryClearcoatNormal,\s*material,\s*reflectedLight\s*\);/g,
        '\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        ',
      )
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsBegin)
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader)
    }
  }
}

const DEFAULT_CONFIG = {
  count: 200,
  colors: [0, 0, 0] as number[],
  ambientColor: 0xffffff,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: { metalness: 0.5, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.15 } as Record<string, unknown>,
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
}

interface BallpitConfig {
  count?: number
  colors?: number[]
  ambientColor?: number
  ambientIntensity?: number
  lightIntensity?: number
  materialParams?: Record<string, unknown>
  minSize?: number
  maxSize?: number
  size0?: number
  gravity?: number
  friction?: number
  wallBounce?: number
  maxVelocity?: number
  maxX?: number
  maxY?: number
  maxZ?: number
  controlSphere0?: boolean
  followCursor?: boolean
}

const _dummy = new Object3D()

class BallInstances extends InstancedMesh {
  config: typeof DEFAULT_CONFIG
  physics: PhysicsSystem
  ambientLight: AmbientLight
  light: PointLight

  constructor(renderer: WebGLRenderer, userConfig: BallpitConfig = {}) {
    const config = { ...DEFAULT_CONFIG, ...userConfig }
    const pmremGenerator = new PMREMGenerator(renderer)
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture
    pmremGenerator.dispose()

    const geometry = new SphereGeometry(1, 32, 32)
    const material = new BallMaterial({ envMap: envTexture, ...config.materialParams })
    // ponytail: envMapRotation.x set via bracket to avoid TS strict
    ;(material.envMapRotation as unknown as Record<string, number>).x = -Math.PI / 2

    super(geometry, material, config.count)
    this.config = config
    this.physics = new PhysicsSystem(config)
    this.ambientLight = new AmbientLight(config.ambientColor, config.ambientIntensity)
    this.add(this.ambientLight)
    this.light = new PointLight(config.colors[0], config.lightIntensity)
    this.add(this.light)
    this.#setColors(config.colors)
  }

  #setColors(colors: number[]) {
    if (Array.isArray(colors) && colors.length > 1) {
      const gradient = createColorGradient(colors)
      for (let i = 0; i < this.count; i++) {
        this.setColorAt(i, gradient.getColorAt(i / this.count))
        if (i === 0) this.light.color.copy(gradient.getColorAt(i / this.count))
      }
      if (this.instanceColor) this.instanceColor.needsUpdate = true
    }
  }

  update(time: TimeInfo) {
    this.physics.update(time)
    for (let i = 0; i < this.count; i++) {
      _dummy.position.fromArray(this.physics.positionData, 3 * i)
      if (i === 0 && this.config.followCursor === false) {
        _dummy.scale.setScalar(0)
      } else {
        _dummy.scale.setScalar(this.physics.sizeData[i])
      }
      _dummy.updateMatrix()
      this.setMatrixAt(i, _dummy.matrix)
      if (i === 0) this.light.position.copy(_dummy.position)
    }
    this.instanceMatrix.needsUpdate = true
  }
}

function createColorGradient(colors: number[]) {
  const colorObjects = colors.map(c => new Color(c))
  return {
    getColorAt: (ratio: number, out = new Color()) => {
      const scaled = Math.max(0, Math.min(1, ratio)) * (colors.length - 1)
      const idx = Math.floor(scaled)
      if (idx >= colors.length - 1) return colorObjects[colors.length - 1].clone()
      const alpha = scaled - idx
      const start = colorObjects[idx]
      const end = colorObjects[idx + 1]
      out.r = start.r + alpha * (end.r - start.r)
      out.g = start.g + alpha * (end.g - start.g)
      out.b = start.b + alpha * (end.b - start.b)
      return out
    },
  }
}

interface BallpitInstance {
  three: ThreeEngine
  spheres: BallInstances
  setCount: (n: number) => void
  togglePause: () => void
  dispose: () => void
}

function createBallpit(canvas: HTMLCanvasElement, userConfig: BallpitConfig = {}): BallpitInstance {
  const engine = new ThreeEngine({ canvas, size: 'parent', rendererOptions: { antialias: true, alpha: true } })
  engine.renderer.toneMapping = ACESFilmicToneMapping
  engine.camera.position.set(0, 0, 20)
  engine.camera.lookAt(0, 0, 0)
  engine.cameraMaxAspect = 1.5
  engine.resize()

  let paused = false
  let ballSpheres: BallInstances

  function init(config: BallpitConfig = {}) {
    if (ballSpheres) { engine.clear(); engine.scene.remove(ballSpheres) }
    ballSpheres = new BallInstances(engine.renderer, config)
    engine.scene.add(ballSpheres)
  }
  init(userConfig)

  const raycaster = new Raycaster()
  const plane = new Plane(new Vector3(0, 0, 1), 0)
  const intersectPoint = new Vector3()

  canvas.style.touchAction = 'none'
  canvas.style.userSelect = 'none'
  ;(canvas.style as unknown as Record<string, string>).webkitUserSelect = 'none'

  const pointerTracker = createPointerTracker(canvas, {
    onMove() {
      raycaster.setFromCamera(pointerTracker.nPosition, engine.camera)
      engine.camera.getWorldDirection(plane.normal)
      raycaster.ray.intersectPlane(plane, intersectPoint)
      ballSpheres.physics.center.copy(intersectPoint)
      ballSpheres.config.controlSphere0 = true
    },
    onLeave() {
      ballSpheres.config.controlSphere0 = false
    },
  })

  engine.onBeforeRender = (time: TimeInfo) => {
    if (!paused) ballSpheres.update(time)
  }

  engine.onAfterResize = (size: ThreeEngineSize) => {
    ballSpheres.config.maxX = size.wWidth / 2
    ballSpheres.config.maxY = size.wHeight / 2
  }

  return {
    get three() { return engine },
    get spheres() { return ballSpheres },
    setCount(n: number) { init({ ...ballSpheres.config, count: n }) },
    togglePause() { paused = !paused },
    dispose() {
      pointerTracker.dispose()
      engine.dispose()
    },
  }
}

// ── React component ──────────────────────────────────────────────────────
interface BallpitProps extends BallpitConfig {
  className?: string
}

const Ballpit = ({ className = '', followCursor = true, ...props }: BallpitProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const instanceRef = useRef<BallpitInstance | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    instanceRef.current = createBallpit(canvas, { followCursor, ...props })

    return () => {
      instanceRef.current?.dispose()
      instanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />
}

export default Ballpit