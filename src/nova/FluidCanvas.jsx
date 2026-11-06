import { useEffect, useRef } from 'react';

/* Living blue "liquid glass" field, drawn with a small WebGL shader.
   - Domain-warped noise gives slow, silky folds; thin bright filaments read as glass edges.
   - The pointer gently pulls the fluid.
   - Pauses when off-screen or in a hidden tab; a single still frame for reduced motion.
   - Without WebGL the CSS fallback on the stage shows instead. */

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPull;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 M = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = M * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  float t = uTime * 0.11;

  // pointer pull
  vec2 d = p - uMouse;
  p -= d * uPull * 0.3 * exp(-dot(d, d) * 2.2);

  // large, slow liquid warp -> long silky ribbons
  vec2 w = p * 1.05 + vec2(0.0, 0.15);
  for (int i = 1; i < 6; i++) {
    float fi = float(i);
    w.x += 0.5 / fi * sin(fi * 1.55 * w.y + t * (0.55 + 0.12 * fi) + 0.4 * fi);
    w.y += 0.38 / fi * cos(fi * 1.25 * w.x - t * (0.45 + 0.1 * fi) + 1.9 * fi);
  }

  // fine smoke detail riding on the ribbons
  float n = fbm(w * 1.6 + vec2(t * 0.35, -t * 0.2));

  float s = sin(w.x * 2.1 + w.y * 1.25 + n * 1.6);          // ribbon body
  float s2 = sin(w.y * 1.7 - w.x * 0.9 + n * 2.4 + 1.3);    // cross folds

  vec3 black = vec3(0.004, 0.008, 0.028);
  vec3 navy  = vec3(0.012, 0.045, 0.2);
  vec3 royal = vec3(0.07, 0.2, 0.9);
  vec3 elec  = vec3(0.22, 0.52, 1.0);
  vec3 ice   = vec3(0.82, 0.92, 1.0);

  float body = smoothstep(-0.05, 1.0, s);
  vec3 col = mix(black, navy, smoothstep(-0.7, 0.35, s));
  col = mix(col, royal, body * (0.42 + 0.6 * n));
  col = mix(col, elec, pow(body, 3.2) * smoothstep(0.35, 0.78, n) * 0.95);

  // a second, fainter sheet crossing the first
  float sheet = smoothstep(0.45, 1.0, s2) * (1.0 - body * 0.6);
  col = mix(col, royal * 0.85, sheet * 0.55);

  // deep valleys between the folds
  col *= 0.3 + 0.7 * smoothstep(-0.85, 0.45, max(s, s2 - 0.35));

  // glassy rims: thin specular lines on the crests
  float rim = pow(max(0.0, s), 26.0);
  float rim2 = pow(max(0.0, s2), 34.0) * (0.35 + body);
  col += ice * (rim * 0.85 + rim2 * 0.5);

  // soft bloom
  col += elec * pow(max(0.0, s2), 5.0) * 0.12;

  // gentle vignette; keep the edges alive
  vec2 v = (uv - vec2(0.5, 0.55)) * vec2(0.9, 1.0);
  col *= mix(0.45, 1.05, smoothstep(0.95, 0.15, length(v)));

  // fine grain to avoid banding
  col += (hash(mod(gl_FragCoord.xy, 64.0) + fract(uTime * 7.0)) - 0.5) * 0.02;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function FluidCanvas({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas.parentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    // Pixel budget for the (soft) field: keeps phones and weak GPUs cool.
    const BUDGET = touch ? 200000 : 420000;
    const FRAME_MS = touch ? 1000 / 30 : 0;

    let gl = null;
    let loc = {};
    let w = 1;
    let h = 1;
    let raf = 0;
    let last = 0;
    let onScreen = true;
    let ok = false;

    const init = () => {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
      if (!gl) return false;
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      loc = {
        res: gl.getUniformLocation(prog, 'uRes'),
        time: gl.getUniformLocation(prog, 'uTime'),
        mouse: gl.getUniformLocation(prog, 'uMouse'),
        pull: gl.getUniformLocation(prog, 'uPull'),
      };
      return true;
    };

    const mouse = { x: 0.25, y: 0.1, tx: 0.25, ty: 0.1, pull: 0, tpull: 0 };
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      const m = Math.min(r.width, r.height);
      mouse.tx = (e.clientX - r.left - r.width / 2) / m;
      mouse.ty = -(e.clientY - r.top - r.height / 2) / m;
      mouse.tpull = 1;
    };
    const onLeave = () => { mouse.tpull = 0; };

    const start = performance.now() - 9000;
    const draw = (t) => {
      if (!ok) return;
      gl.uniform2f(loc.res, w, h);
      gl.uniform1f(loc.time, t);
      gl.uniform2f(loc.mouse, mouse.x, mouse.y);
      gl.uniform1f(loc.pull, mouse.pull);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      if (!ok) return;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const area = Math.max(1, r.width * r.height);
      const scale = Math.min(dpr * 0.62, Math.sqrt(BUDGET / area));
      w = Math.max(1, Math.round(r.width * scale));
      h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      if (reduced) draw(14);
    };

    const frame = (now) => {
      raf = 0;
      if (!ok || !onScreen || document.hidden) return;
      raf = requestAnimationFrame(frame);
      if (FRAME_MS && now - last < FRAME_MS - 2) return;
      last = now;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      mouse.pull += (mouse.tpull - mouse.pull) * 0.05;
      draw((now - start) / 1000);
    };
    const kick = () => {
      if (ok && !reduced && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const enable = () => {
      ok = init();
      host.classList.toggle('has-gl', ok);
      if (ok) { resize(); kick(); }
    };

    // If the browser drops the GPU context, show the CSS fallback instead of a blank box.
    const onLost = (e) => {
      e.preventDefault();
      ok = false;
      cancelAnimationFrame(raf);
      raf = 0;
      host.classList.remove('has-gl');
    };
    const onRestored = () => enable();
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); });
    io.observe(canvas);
    document.addEventListener('visibilitychange', kick);
    if (!reduced) {
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
    }
    enable();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      document.removeEventListener('visibilitychange', kick);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.classList.remove('has-gl');
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
