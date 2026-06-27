'use client';
import { useEffect, useRef } from 'react';

interface SplashCursorProps {
  SIM_RESOLUTION?: number
  DYE_RESOLUTION?: number
  CAPTURE_RESOLUTION?: number
  DENSITY_DISSIPATION?: number
  VELOCITY_DISSIPATION?: number
  PRESSURE?: number
  PRESSURE_ITERATIONS?: number
  CURL?: number
  SPLAT_RADIUS?: number
  SPLAT_FORCE?: number
  SHADING?: boolean
  COLOR_UPDATE_SPEED?: number
  BACK_COLOR?: { r: number; g: number; b: number }
  TRANSPARENT?: boolean
  RAINBOW_MODE?: boolean
  COLOR?: string
}

function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
  RAINBOW_MODE = true,
  COLOR = '#ff0000',
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isActive = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: Record<string, any> = {
      SIM_RESOLUTION,
      DYE_RESOLUTION,
      CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION,
      PRESSURE,
      PRESSURE_ITERATIONS,
      CURL,
      SPLAT_RADIUS,
      SPLAT_FORCE,
      SHADING,
      COLOR_UPDATE_SPEED,
      PAUSED: false,
      BACK_COLOR,
      TRANSPARENT,
      RAINBOW_MODE,
      COLOR,
    };

    const pointers: Array<{
      id: number; texcoordX: number; texcoordY: number;
      prevTexcoordX: number; prevTexcoordY: number;
      deltaX: number; deltaY: number; down: boolean; moved: boolean; color: { r: number; g: number; b: number };
    }> = [{ id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, down: false, moved: false, color: { r: 0, g: 0, b: 0 } }];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: any = getWebGLContext(canvas);
    const gl: any = ctx.gl;
    const ext: any = ctx.ext;
    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getWebGLContext(canvas: HTMLCanvasElement): { gl: any; ext: any } {
      const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
      let gl: any = canvas.getContext('webgl2', params);
      const isWebGL2 = !!gl;
      if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
      if (!gl) throw new Error('WebGL not supported');

      let halfFloat: { HALF_FLOAT_OES: number } | null = null;
      let supportLinearFiltering: any = null;
      if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
      } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
      }
      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat && halfFloat.HALF_FLOAT_OES);
      let formatRGBA: { internalFormat: number; format: number } | null;
      let formatRG: { internalFormat: number; format: number } | null;
      let formatR: { internalFormat: number; format: number } | null;

      if (isWebGL2) {
        formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      return {
        gl,
        ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering },
      };
    }

    function getSupportedFormat(gl: any, internalFormat: number, format: number, type: number): { internalFormat: number; format: number } | null {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        switch (internalFormat) {
          case (gl as unknown as Record<string, number>).R16F:
            return getSupportedFormat(gl, (gl as unknown as Record<string, number>).RG16F, gl.RG, type);
          case (gl as unknown as Record<string, number>).RG16F:
            return getSupportedFormat(gl, (gl as unknown as Record<string, number>).RGBA16F, gl.RGBA, type);
          default:
            return null;
        }
      }
      return { internalFormat, format };
    }

    function supportRenderTextureFormat(gl: any, internalFormat: number, format: number, type: number): boolean {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(fbo);
      return status === gl.FRAMEBUFFER_COMPLETE;
    }

    // Shader sources
    const baseVertexSrc = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const copyFragSrc = `precision mediump float; precision mediump sampler2D; varying highp vec2 vUv; uniform sampler2D uTexture; void main () { gl_FragColor = texture2D(uTexture, vUv); }`;
    const clearFragSrc = `precision mediump float; precision mediump sampler2D; varying highp vec2 vUv; uniform sampler2D uTexture; uniform float value; void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

    const displayFragSrc = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uTexture; uniform sampler2D uDithering; uniform vec2 ditherScale; uniform vec2 texelSize;
      vec3 linearToGamma (vec3 color) { color = max(color, vec3(0)); return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0)); }
      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb; vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb; vec3 bc = texture2D(uTexture, vB).rgb;
              float dx = length(rc) - length(lc); float dy = length(tc) - length(bc);
              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);
              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif
          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
      }
    `;

    const splatFragSrc = `precision highp float; precision highp sampler2D; varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius; void main () { vec2 p = vUv - point.xy; p.x *= aspectRatio; vec3 splat = exp(-dot(p, p) / radius) * color; vec3 base = texture2D(uTarget, vUv).xyz; gl_FragColor = vec4(base + splat, 1.0); }`;

    const advectionFragSrc = `precision highp float; precision highp sampler2D; varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform vec2 dyeTexelSize; uniform float dt; uniform float dissipation; vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) { vec2 st = uv / tsize - 0.5; vec2 iuv = floor(st); vec2 fuv = fract(st); vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize); vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize); vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize); vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize); return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y); } void main () { vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize; vec4 result = texture2D(uSource, coord); float decay = 1.0 + dissipation * dt; gl_FragColor = result / decay; }`;

    const divergenceFragSrc = `precision mediump float; precision mediump sampler2D; varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB; uniform sampler2D uVelocity; void main () { float L = texture2D(uVelocity, vL).x; float R = texture2D(uVelocity, vR).x; float T = texture2D(uVelocity, vT).y; float B = texture2D(uVelocity, vB).y; vec2 C = texture2D(uVelocity, vUv).xy; if (vL.x < 0.0) { L = -C.x; } if (vR.x > 1.0) { R = -C.x; } if (vT.y > 1.0) { T = -C.y; } if (vB.y < 0.0) { B = -C.y; } float div = 0.5 * (R - L + T - B); gl_FragColor = vec4(div, 0.0, 0.0, 1.0); }`;

    const curlFragSrc = `precision mediump float; precision mediump sampler2D; varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB; uniform sampler2D uVelocity; void main () { float L = texture2D(uVelocity, vL).y; float R = texture2D(uVelocity, vR).y; float T = texture2D(uVelocity, vT).x; float B = texture2D(uVelocity, vB).x; float vorticity = R - L - T + B; gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0); }`;

    const vorticityFragSrc = `precision highp float; precision highp sampler2D; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt; void main () { float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x; float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x; float C = texture2D(uCurl, vUv).x; vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0; vec2 velocity = texture2D(uVelocity, vUv).xy; velocity += force * dt; velocity = min(max(velocity, -1000.0), 1000.0); gl_FragColor = vec4(velocity, 0.0, 1.0); }`;

    const pressureFragSrc = `precision mediump float; precision mediump sampler2D; varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB; uniform sampler2D uPressure; uniform sampler2D uDivergence; void main () { float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x; float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x; float divergence = texture2D(uDivergence, vUv).x; float pressure = (L + R + B + T - divergence) * 0.25; gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0); }`;

    const gradientSubtractFragSrc = `precision mediump float; precision mediump sampler2D; varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB; uniform sampler2D uPressure; uniform sampler2D uVelocity; void main () { float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x; float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x; vec2 velocity = texture2D(uVelocity, vUv).xy; velocity.xy -= vec2(R - L, T - B); gl_FragColor = vec4(velocity, 0.0, 1.0); }`;

    function compileShader(type: number, source: string, keywords?: string[]) {
      const src = keywords ? '#define ' + keywords.join('\n#define ') + '\n' + source : source;
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.trace(gl.getShaderInfoLog(shader));
      return shader;
    }

    const baseVertexShader = compileShader(gl.VERTEX_SHADER, baseVertexSrc);
    const copyFragShader = compileShader(gl.FRAGMENT_SHADER, copyFragSrc);
    const clearFragShader = compileShader(gl.FRAGMENT_SHADER, clearFragSrc);
    const splatFragShader = compileShader(gl.FRAGMENT_SHADER, splatFragSrc);
    const advectionFragShader = compileShader(gl.FRAGMENT_SHADER, advectionFragSrc);
    const divergenceFragShader = compileShader(gl.FRAGMENT_SHADER, divergenceFragSrc);
    const curlFragShader = compileShader(gl.FRAGMENT_SHADER, curlFragSrc);
    const vorticityFragShader = compileShader(gl.FRAGMENT_SHADER, vorticityFragSrc);
    const pressureFragShader = compileShader(gl.FRAGMENT_SHADER, pressureFragSrc);
    const gradientSubtractFragShader = compileShader(gl.FRAGMENT_SHADER, gradientSubtractFragSrc);

    function createProgram(vs: WebGLShader, fs: WebGLShader) {
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.trace(gl.getProgramInfoLog(prog));
      return prog;
    }

    function getUniforms(program: WebGLProgram) {
      const uniforms: Record<string, WebGLUniformLocation> = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(program, i)!.name;
        uniforms[name] = gl.getUniformLocation(program, name)!;
      }
      return uniforms;
    }

    class ShaderProgram {
      uniforms: Record<string, WebGLUniformLocation> = {}
      program: WebGLProgram
      constructor(vs: WebGLShader, fs: WebGLShader) { this.program = createProgram(vs, fs); this.uniforms = getUniforms(this.program); }
      bind() { gl.useProgram(this.program); }
    }

    class DisplayMaterial {
      programs: Record<number, WebGLProgram> = {}
      activeProgram: WebGLProgram | null = null
      uniforms: Record<string, WebGLUniformLocation> = {}
      vertexShader: WebGLShader
      fragmentSource: string
      constructor(vs: WebGLShader, fs: string) { this.vertexShader = vs; this.fragmentSource = fs; }
      setKeywords(keywords: string[]) {
        let hash = 0;
        for (const k of keywords) hash += hashCode(k);
        if (this.programs[hash]) { const p = this.programs[hash]; if (p !== this.activeProgram) { this.uniforms = getUniforms(p); this.activeProgram = p; } return; }
        const fragShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentSource, keywords);
        const prog = createProgram(this.vertexShader, fragShader);
        this.programs[hash] = prog;
        this.uniforms = getUniforms(prog);
        this.activeProgram = prog;
      }
      bind() { if (this.activeProgram) gl.useProgram(this.activeProgram); }
    }

    const copyProgram = new ShaderProgram(baseVertexShader, copyFragShader);
    const clearProgram = new ShaderProgram(baseVertexShader, clearFragShader);
    const splatProgram = new ShaderProgram(baseVertexShader, splatFragShader);
    const advectionProgram = new ShaderProgram(baseVertexShader, advectionFragShader);
    const divergenceProgram = new ShaderProgram(baseVertexShader, divergenceFragShader);
    const curlProgram = new ShaderProgram(baseVertexShader, curlFragShader);
    const vorticityProgram = new ShaderProgram(baseVertexShader, vorticityFragShader);
    const pressureProgram = new ShaderProgram(baseVertexShader, pressureFragShader);
    const gradientSubtractProgram = new ShaderProgram(baseVertexShader, gradientSubtractFragShader);
    const displayMaterial = new DisplayMaterial(baseVertexShader, displayFragSrc);

    // Framebuffers
    let dye: ReturnType<typeof createDoubleFBO> | null = null;
    let velocity: ReturnType<typeof createDoubleFBO> | null = null;
    let divergence: ReturnType<typeof createFBO> | null = null;
    let curl: ReturnType<typeof createFBO> | null = null;
    let pressure: ReturnType<typeof createDoubleFBO> | null = null;

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, fbo, width: w, height: h, texelSizeX: 1.0 / w, texelSizeY: 1.0 / h, attach(id: number) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; } };
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return { width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY, get read() { return fbo1; }, set read(v) { fbo1 = v; }, get write() { return fbo2; }, set write(v) { fbo2 = v; }, swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; } };
    }

    function resizeFBO(target: ReturnType<typeof createFBO>, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      const newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(newFBO);
      return newFBO;
    }

    function resizeDoubleFBO(target: ReturnType<typeof createDoubleFBO>, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w; target.height = h;
      target.texelSizeX = 1.0 / w; target.texelSizeY = 1.0 / h;
      return target;
    }

    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      return (target: ReturnType<typeof createFBO> | null, clear = false) => {
        if (target == null) { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
        else { gl.viewport(0, 0, target.width, target.height); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
        if (clear) { gl.clearColor(0.0, 0.0, 0.0, 1.0); gl.clear(gl.COLOR_BUFFER_BIT); }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);
      if (!dye) dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
      else dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
      if (!velocity) velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
      else velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    }

    function updateKeywords() { const k: string[] = []; if (config.SHADING) k.push('SHADING'); displayMaterial.setKeywords(k); }

    updateKeywords();
    initFramebuffers();
    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0.0;

    function updateFrame() {
      if (!isActive) return;
      const dt = calcDeltaTime();
      if (resizeCanvas()) initFramebuffers();
      updateColors(dt);
      applyInputs();
      step(dt);
      render(null);
      animationFrameId.current = requestAnimationFrame(updateFrame);
    }

    function calcDeltaTime() { const now = Date.now(); let dt = (now - lastUpdateTime) / 1000; dt = Math.min(dt, 0.016666); lastUpdateTime = now; return dt; }

    function resizeCanvas() { const cvs = canvas as HTMLCanvasElement; const w = scaleByPixelRatio(cvs.clientWidth); const h = scaleByPixelRatio(cvs.clientHeight); if (cvs.width !== w || cvs.height !== h) { cvs.width = w; cvs.height = h; return true; } return false; }

    function updateColors(dt: number) { colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED; if (colorUpdateTimer >= 1) { colorUpdateTimer = wrap(colorUpdateTimer, 0, 1); pointers.forEach(p => { p.color = generateColor(); }); } }

    function applyInputs() { pointers.forEach(p => { if (p.moved) { p.moved = false; splatPointer(p); } }); }

    function step(dt: number) {
      gl.disable(gl.BLEND);
      curlProgram.bind(); gl.uniform2f(curlProgram.uniforms.texelSize, velocity!.texelSizeX, velocity!.texelSizeY); gl.uniform1i(curlProgram.uniforms.uVelocity, velocity!.read.attach(0)); blit(curl);
      vorticityProgram.bind(); gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity!.texelSizeX, velocity!.texelSizeY); gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity!.read.attach(0)); gl.uniform1i(vorticityProgram.uniforms.uCurl, curl!.attach(1)); gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL); gl.uniform1f(vorticityProgram.uniforms.dt, dt); blit(velocity!.write); velocity!.swap();
      divergenceProgram.bind(); gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity!.texelSizeX, velocity!.texelSizeY); gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity!.read.attach(0)); blit(divergence);
      clearProgram.bind(); gl.uniform1i(clearProgram.uniforms.uTexture, pressure!.read.attach(0)); gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE); blit(pressure!.write); pressure!.swap();
      pressureProgram.bind(); gl.uniform2f(pressureProgram.uniforms.texelSize, velocity!.texelSizeX, velocity!.texelSizeY); gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence!.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) { gl.uniform1i(pressureProgram.uniforms.uPressure, pressure!.read.attach(1)); blit(pressure!.write); pressure!.swap(); }
      gradientSubtractProgram.bind(); gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity!.texelSizeX, velocity!.texelSizeY); gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure!.read.attach(0)); gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity!.read.attach(1)); blit(velocity!.write); velocity!.swap();
      advectionProgram.bind(); gl.uniform2f(advectionProgram.uniforms.texelSize, velocity!.texelSizeX, velocity!.texelSizeY);
      const velocityId = velocity!.read.attach(0); gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId); gl.uniform1i(advectionProgram.uniforms.uSource, velocityId); gl.uniform1f(advectionProgram.uniforms.dt, dt); gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION); blit(velocity!.write); velocity!.swap();
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity!.read.attach(0)); gl.uniform1i(advectionProgram.uniforms.uSource, dye!.read.attach(1)); gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION); blit(dye!.write); dye!.swap();
    }

    function render(target: ReturnType<typeof createFBO> | null) { gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.BLEND); drawDisplay(target); }

    function drawDisplay(target: ReturnType<typeof createFBO> | null) { const w = target == null ? gl.drawingBufferWidth : target.width; const h = target == null ? gl.drawingBufferHeight : target.height; displayMaterial.bind(); if (config.SHADING) gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / w, 1.0 / h); gl.uniform1i(displayMaterial.uniforms.uTexture, dye!.read.attach(0)); blit(target); }

    function splatPointer(pointer: (typeof pointers)[0]) { splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX * config.SPLAT_FORCE, pointer.deltaY * config.SPLAT_FORCE, pointer.color); }

    function clickSplat(pointer: { texcoordX: number; texcoordY: number }) { const color = generateColor(); color.r *= 10.0; color.g *= 10.0; color.b *= 10.0; splat(pointer.texcoordX, pointer.texcoordY, 10 * (Math.random() - 0.5), 30 * (Math.random() - 0.5), color); }

    function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
      const cvs = canvas as HTMLCanvasElement;
      splatProgram.bind(); gl.uniform1i(splatProgram.uniforms.uTarget, velocity!.read.attach(0)); gl.uniform1f(splatProgram.uniforms.aspectRatio, cvs.width / cvs.height); gl.uniform2f(splatProgram.uniforms.point, x, y); gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0); gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0)); blit(velocity!.write); velocity!.swap();
      gl.uniform1i(splatProgram.uniforms.uTarget, dye!.read.attach(0)); gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b); blit(dye!.write); dye!.swap();
    }

    function correctRadius(radius: number) { const cvs = canvas as HTMLCanvasElement; let a = cvs.width / cvs.height; if (a > 1) radius *= a; return radius; }

    function generateColor(): { r: number; g: number; b: number } { if (!config.RAINBOW_MODE) return hexToRGB(config.COLOR); const c = HSVtoRGB(Math.random(), 1.0, 1.0); c.r *= 0.15; c.g *= 0.15; c.b *= 0.15; return c; }

    function hexToRGB(hex: string) { let v = hex.replace('#', ''); if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]; return { r: parseInt(v.slice(0, 2), 16) / 255 * 0.15, g: parseInt(v.slice(2, 4), 16) / 255 * 0.15, b: parseInt(v.slice(4, 6), 16) / 255 * 0.15 }; }

    function HSVtoRGB(h: number, s: number, v: number) { let r = 0, g = 0, b = 0; const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s); switch (i % 6) { case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break; case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break; case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break; } return { r, g, b }; }

    function wrap(value: number, min: number, max: number) { const r = max - min; if (r === 0) return min; return ((value - min) % r) + min; }

    function getResolution(resolution: number) { let a = gl.drawingBufferWidth / gl.drawingBufferHeight; if (a < 1) a = 1.0 / a; const min = Math.round(resolution), max = Math.round(resolution * a); return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max }; }

    function scaleByPixelRatio(input: number) { return Math.floor(input * (window.devicePixelRatio || 1)); }

    function hashCode(s: string) { let hash = 0; for (let i = 0; i < s.length; i++) { hash = (hash << 5) - hash + s.charCodeAt(i); hash |= 0; } return hash; }

    let firstMouseMoveHandled = false;

    function handleMouseDown(e: MouseEvent) {
      const cvs = canvas as HTMLCanvasElement;
      const p = pointers[0]; const posX = scaleByPixelRatio(e.clientX); const posY = scaleByPixelRatio(e.clientY);
      p.texcoordX = posX / cvs.width; p.texcoordY = 1.0 - posY / cvs.height; p.prevTexcoordX = p.texcoordX; p.prevTexcoordY = p.texcoordY; p.deltaX = 0; p.deltaY = 0; p.down = true; p.moved = false; p.color = generateColor();
      clickSplat(p);
    }

    function handleMouseMove(e: MouseEvent) {
      const cvs = canvas as HTMLCanvasElement;
      const p = pointers[0]; const posX = scaleByPixelRatio(e.clientX); const posY = scaleByPixelRatio(e.clientY);
      if (!firstMouseMoveHandled) { p.color = generateColor(); p.texcoordX = posX / cvs.width; p.texcoordY = 1.0 - posY / cvs.height; p.prevTexcoordX = p.texcoordX; p.prevTexcoordY = p.texcoordY; p.deltaX = 0; p.deltaY = 0; p.moved = false; firstMouseMoveHandled = true; }
      else { p.prevTexcoordX = p.texcoordX; p.prevTexcoordY = p.texcoordY; p.texcoordX = posX / cvs.width; p.texcoordY = 1.0 - posY / cvs.height; p.deltaX = p.texcoordX - p.prevTexcoordX; p.deltaY = p.texcoordY - p.prevTexcoordY; if (cvs.width / cvs.height < 1) p.deltaX *= cvs.width / cvs.height; if (cvs.width / cvs.height > 1) p.deltaY /= cvs.width / cvs.height; p.moved = Math.abs(p.deltaX) > 0 || Math.abs(p.deltaY) > 0; }
    }

    function handleTouchStart(e: TouchEvent) { const cvs = canvas as HTMLCanvasElement; const touches = e.targetTouches; const p = pointers[0]; for (let i = 0; i < touches.length; i++) { const posX = scaleByPixelRatio(touches[i].clientX), posY = scaleByPixelRatio(touches[i].clientY); p.id = touches[i].identifier; p.down = true; p.moved = false; p.texcoordX = posX / cvs.width; p.texcoordY = 1.0 - posY / cvs.height; p.prevTexcoordX = p.texcoordX; p.prevTexcoordY = p.texcoordY; p.deltaX = 0; p.deltaY = 0; p.color = generateColor(); } }

    function handleTouchMove(e: TouchEvent) { const cvs = canvas as HTMLCanvasElement; const touches = e.targetTouches; const p = pointers[0]; for (let i = 0; i < touches.length; i++) { const posX = scaleByPixelRatio(touches[i].clientX), posY = scaleByPixelRatio(touches[i].clientY); p.prevTexcoordX = p.texcoordX; p.prevTexcoordY = p.texcoordY; p.texcoordX = posX / cvs.width; p.texcoordY = 1.0 - posY / cvs.height; p.deltaX = p.texcoordX - p.prevTexcoordX; p.deltaY = p.texcoordY - p.prevTexcoordY; p.moved = Math.abs(p.deltaX) > 0 || Math.abs(p.deltaY) > 0; } }

    function handleTouchEnd() { pointers[0].down = false; }

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    updateFrame();

    return () => {
      isActive = false;
      if (animationFrameId.current) { cancelAnimationFrame(animationFrameId.current); animationFrameId.current = null; }
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 50, pointerEvents: 'none', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} id="fluid" style={{ width: '100vw', height: '100vh', display: 'block' }} />
    </div>
  );
}

export default SplashCursor;