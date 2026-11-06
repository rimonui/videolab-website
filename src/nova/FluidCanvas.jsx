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
precision highp float;
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
  col += (hash(gl_FragCoord.xy + fract(uTime * 7.0)) - 0.5) * 0.02;

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
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');
    const uPull = gl.getUniformLocation(prog, 'uPull');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SCALE = 0.62; // render below native size; the field is soft by nature
    let w = 1, h = 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * dpr * SCALE));
      h = Math.max(1, Math.round(r.height * dpr * SCALE));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      if (reduced) draw(14);
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
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uPull, mouse.pull);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let onScreen = true;
    const frame = (now) => {
      raf = 0;
      if (!onScreen || document.hidden) return;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      mouse.pull += (mouse.tpull - mouse.pull) * 0.03;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!reduced && !raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame); };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); });
    io.observe(canvas);
    document.addEventListener('visibilitychange', kick);
    if (!reduced) {
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
    }
    host.classList.add('has-gl');
    kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', kick);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.classList.remove('has-gl');
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
