// olaís — fumaça de luz que segue o mouse (WebGL) + anel do cursor
// Sem dependências. Desliga sozinho em "reduzir movimento" e sem WebGL.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  /* ---------------- Anel do cursor ---------------- */
  if (finePointer && !reduce) {
    const ring = document.createElement('div');
    ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true');
    document.body.append(ring);
    let x = -100, y = -100, rx = x, ry = y, shown = false;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!shown) { rx = x; ry = y; shown = true; ring.classList.add('is-on'); }
      const t = e.target.closest?.('a, button, input, textarea, label, [role="button"]');
      ring.classList.toggle('is-hover', !!t);
    }, { passive: true });
    addEventListener('pointerdown', () => ring.classList.add('is-down'));
    addEventListener('pointerup', () => ring.classList.remove('is-down'));
    document.addEventListener('pointerleave', () => { ring.classList.remove('is-on'); shown = false; });
    const loop = () => {
      rx += (x - rx) * .2; ry += (y - ry) * .2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------------- Fumaça (hero e dobra de descanso) ---------------- */
  if (reduce) return;
  const hosts = [...document.querySelectorAll('[data-fluid]')];
  hosts.forEach(initFluid);
  if (hosts.length) root.classList.add('has-fluid');

  function initFluid(host) {
  const canvas = document.createElement('canvas');
  canvas.className = 'fluid'; canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;
  host.prepend(canvas);

  const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const TRAIL = 12;
  const frag = `
  precision highp float;
  uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec2 uVel;
  uniform vec3 uTrail[${TRAIL}];
  uniform vec3 cDeep; uniform vec3 cMid; uniform vec3 cGlow; uniform vec3 cAccent;
  uniform float uLight;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
  float fbm(vec2 p){ float v = 0., a = .5; mat2 r = mat2(.8,-.6,.6,.8);
    for(int i=0;i<5;i++){ v += a*noise(p); p = r*p*2.02 + 3.1; a *= .5; } return v; }
  void main(){
    vec2 uv = gl_FragCoord.xy / uRes; float asp = uRes.x / uRes.y;
    vec2 p = vec2(uv.x * asp, uv.y);
    vec2 m = vec2(uMouse.x * asp, uMouse.y);
    // o mouse "empurra" e gira a fumaça ao redor dele
    vec2 d = p - m; float fall = exp(-dot(d, d) * 5.);
    float ang = fall * (1.2 + length(uVel) * 18.);
    p = m + mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * d - uVel * fall * 2.5;
    float t = uTime * .06;
    vec2 q = vec2(fbm(p * 1.6 + vec2(0., t)), fbm(p * 1.6 + vec2(5.2, 1.3 - t)));
    vec2 r = vec2(fbm(p * 1.6 + 3. * q + vec2(1.7, 9.2) + t * 1.4), fbm(p * 1.6 + 3. * q + vec2(8.3, 2.8) - t));
    float f = fbm(p * 1.4 + 3.2 * r);
    // rastro de luz deixado pelo mouse
    float trail = 0.;
    for(int i=0;i<${TRAIL};i++){ vec3 tp = uTrail[i]; vec2 td = vec2(uv.x*asp, uv.y) - vec2(tp.x*asp, tp.y);
      trail += tp.z * exp(-dot(td, td) * 40.); }
    trail = clamp(trail, 0., 1.);
    float dens = smoothstep(.25, .95, f * 1.1 + length(q) * .35);
    vec3 col = mix(cDeep, cMid, dens);
    col = mix(col, cGlow, smoothstep(.55, 1., f + r.x * .3) * .85);
    col += cAccent * pow(smoothstep(.7, 1., r.y * f * 1.6), 2.) * .35;
    col = mix(col, cGlow, trail * .55 * (.5 + dens));
    // mais forte à direita/acima, esmaece embaixo para o texto respirar
    float vign = smoothstep(1.25, .2, length((uv - vec2(.62, .62)) * vec2(1., 1.25)));
    float a = clamp((dens * .85 + trail * .6) * vign, 0., 1.) * mix(1., .55, uLight);
    gl_FragColor = vec4(col * a, a);
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
  const vs = sh(gl.VERTEX_SHADER, vert), fs = sh(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const u = { res: U('uRes'), time: U('uTime'), mouse: U('uMouse'), vel: U('uVel'), trail: U('uTrail'),
    deep: U('cDeep'), mid: U('cMid'), glow: U('cGlow'), accent: U('cAccent'), light: U('uLight') };

  // cores dos tokens da marca
  const hex = h => { h = h.trim().replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
  const css = n => getComputedStyle(root).getPropertyValue(n);
  const setColors = () => {
    const light = root.dataset.theme === 'light' && host.dataset.fluid !== 'dark'; // data-fluid="dark" fica sempre escuro
    gl.uniform3fv(u.deep, hex(css(light ? '--purple-200' : '--purple-900')));
    gl.uniform3fv(u.mid, hex(css(light ? '--purple-400' : '--purple-600')));
    gl.uniform3fv(u.glow, hex(css(light ? '--purple-300' : '--purple-300')));
    gl.uniform3fv(u.accent, hex(css('--lime-400')));
    gl.uniform1f(u.light, light ? 1 : 0);
  };
  setColors();
  new MutationObserver(setColors).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  let w = 0, h = 0;
  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * .5; // meia resolução: leve e já fica suave
    w = Math.max(1, Math.round(host.clientWidth * scale)); h = Math.max(1, Math.round(host.clientHeight * scale));
    canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(u.res, w, h);
  };
  resize(); addEventListener('resize', resize);

  // mouse (normalizado 0–1, origem embaixo à esquerda como no WebGL)
  const target = { x: .7, y: .6 }, mouse = { x: .7, y: .6 }, vel = { x: 0, y: 0 };
  let idle = true, lastMove = 0;
  const trail = Array.from({ length: TRAIL }, () => [0, 0, 0]);
  const onMove = (cx, cy) => {
    const r = host.getBoundingClientRect();
    if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return; // só reage com o mouse sobre a dobra
    target.x = (cx - r.left) / r.width; target.y = 1 - (cy - r.top) / r.height;
    idle = false; lastMove = performance.now();
  };
  addEventListener('pointermove', e => onMove(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });

  let visible = true, raf = 0, t0 = performance.now(), last = t0, stamp = 0;
  const frame = now => {
    raf = 0;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (now - lastMove > 2500) idle = true;
    if (idle) { // sem mouse: a luz passeia devagar sozinha
      const s = (now - t0) / 1000;
      target.x = .68 + Math.cos(s * .23) * .18; target.y = .58 + Math.sin(s * .31) * .16;
    }
    const px = mouse.x, py = mouse.y;
    mouse.x += (target.x - mouse.x) * Math.min(1, dt * 6); mouse.y += (target.y - mouse.y) * Math.min(1, dt * 6);
    vel.x += ((mouse.x - px) - vel.x) * .2; vel.y += ((mouse.y - py) - vel.y) * .2;
    // rastro: guarda posições recentes e vai apagando
    if (now - stamp > 40) { stamp = now; trail.pop(); trail.unshift([mouse.x, mouse.y, idle ? .25 : Math.min(1, .35 + Math.hypot(vel.x, vel.y) * 60)]); }
    trail.forEach(p => { p[2] *= .965; });
    gl.uniform1f(u.time, (now - t0) / 1000);
    gl.uniform2f(u.mouse, mouse.x, mouse.y);
    gl.uniform2f(u.vel, vel.x, vel.y);
    gl.uniform3fv(u.trail, new Float32Array(trail.flat()));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(host);
  document.addEventListener('visibilitychange', start);
  start();
  }
})();
