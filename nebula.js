// olaís — universo em pixels (halftone) para o hero
// Uma nebulosa e um planeta desenhados ponto a ponto, nas cores da marca.
// Mexer o mouse acende o gás; clicar pendura uma estrela nova no céu.
// Sem dependências. Desliga em "reduzir movimento" e sem WebGL (fica o fundo estrelado em CSS).
(() => {
  const host = document.querySelector('[data-nebula]');
  if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Posição do planeta (0–1 da largura/altura; y a partir do topo) e tamanho do "pixel"
  const SKY = { planetX: 0.74, planetY: 0.3, planetR: 0.2, cell: 7 };
  const MAX_STARS = 12, TRAIL = 8;

  const canvas = document.createElement('canvas');
  canvas.className = 'nebula'; canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;
  host.prepend(canvas);

  const frag = `
  precision highp float;
  uniform vec2 uRes; uniform float uTime; uniform float uCell; uniform float uLight;
  uniform vec2 uMouse; uniform float uMouseOn;
  uniform vec3 uTrail[${TRAIL}];
  uniform vec4 uStars[${MAX_STARS}];
  uniform vec3 uPlanet;
  uniform vec3 cDeep; uniform vec3 cMid; uniform vec3 cGlow; uniform vec3 cAccent;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
  float fbm(vec2 p){ float v = 0., a = .5; mat2 r = mat2(.8,-.6,.6,.8);
    for(int i=0;i<4;i++){ v += a*noise(p); p = r*p*2.03 + 7.3; a *= .5; } return v; }

  void main(){
    float asp = uRes.x / uRes.y;
    // cada célula da grade vira um ponto; o brilho da célula define o tamanho do ponto
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec2 cc = (cell + .5) * uCell;
    vec2 uv = cc / uRes;
    vec2 p = vec2(uv.x * asp, uv.y);
    float t = uTime * .035;

    // nebulosa: ruído dobrado sobre si mesmo, mais densa em diagonal
    vec2 q = vec2(fbm(p * 1.7 + vec2(t, 0.)), fbm(p * 1.7 + vec2(4.1, -t)));
    float n = fbm(p * 1.5 + q * 2.6 + vec2(-t * .6, t * .4));
    float band = exp(-pow((uv.y - (1. - uv.x) * .55 - .25) * 2.6, 2.));
    float gas = smoothstep(.3, .85, n) * (.5 + band * .8);

    // planeta: esfera iluminada de baixo à esquerda, com anel de luz na borda
    vec2 pc = vec2(uPlanet.x * asp, uPlanet.y);
    vec2 d = (p - pc) / uPlanet.z; float r = length(d);
    float body = 0., rim = 0.;
    if (r < 1.) {
      vec3 nrm = vec3(d, sqrt(1. - r * r));
      body = clamp(dot(nrm, normalize(vec3(-.6, -.5, .65))), 0., 1.);
      body = pow(body, 1.4) * .95 + fbm(d * 3. + 2.) * .12;
      gas *= .15; // o planeta tapa a nebulosa atrás dele
    }
    rim = exp(-pow((r - 1.) * 14., 2.)) * .55 + smoothstep(1.6, 1., r) * .12;

    // luz do mouse: acende o gás por onde o cursor passa (com rastro)
    float lit = 0.;
    vec2 m = vec2(uMouse.x * asp, uMouse.y);
    lit += exp(-dot(p - m, p - m) * 18.) * uMouseOn;
    for (int i = 0; i < ${TRAIL}; i++) { vec2 tp = vec2(uTrail[i].x * asp, uTrail[i].y); lit += uTrail[i].z * exp(-dot(p - tp, p - tp) * 30.) * .6; }
    lit = clamp(lit, 0., 1.);

    float b = clamp(gas + body + rim + lit * (.35 + n * .9), 0., 1.);
    // estrelas fixas da grade: algumas células piscam com ponto cheio
    float h = hash(cell);
    float twinkle = step(.994, h) * (.55 + .45 * sin(uTime * (1. + h * 3.) + h * 40.));
    b = max(b, twinkle);

    // desenha o ponto (halftone): raio cresce com o brilho
    float rad = uCell * .5 * sqrt(b) * .95;
    float dist = length(gl_FragCoord.xy - cc);
    float dotA = smoothstep(rad, rad - 1.2, dist) * step(.04, b);

    vec3 col = mix(cDeep, cMid, smoothstep(.1, .6, b));
    col = mix(col, cGlow, smoothstep(.55, 1., b));
    col = mix(col, cAccent, lit * smoothstep(.5, .9, n) * .55);
    col = mix(col, vec3(1.), twinkle * .7);

    // estrelas penduradas pelo clique: brilho em cruz, nítido (fora da grade)
    vec2 fp = vec2(gl_FragCoord.x / uRes.x * asp, gl_FragCoord.y / uRes.y);
    vec3 starCol = vec3(0.); float starA = 0.;
    for (int i = 0; i < ${MAX_STARS}; i++) {
      vec4 s = uStars[i]; if (s.w <= 0.) continue;
      float age = uTime - s.z; float grow = smoothstep(0., .6, age);
      vec2 sd = fp - vec2(s.x * asp, s.y); sd *= uRes.y;
      float core = exp(-dot(sd, sd) / (40. * grow + .01));
      float crs = (exp(-abs(sd.x) * .35) * exp(-abs(sd.y) * .028) + exp(-abs(sd.y) * .35) * exp(-abs(sd.x) * .028)) * .9 * grow;
      core += exp(-length(sd) * .09) * .35 * grow; // halo
      float tw = .75 + .25 * sin(uTime * 2.2 + s.x * 30.);
      float a = clamp((core + crs) * tw, 0., 1.);
      starA = max(starA, a); starCol = mix(starCol, mix(cAccent, vec3(1.), core), a);
    }

    float alpha = dotA * mix(.95, .8, uLight);
    vec3 outc = col * alpha;
    outc = outc * (1. - starA) + starCol * starA;
    alpha = max(alpha, starA);
    gl_FragColor = vec4(outc, alpha);
  }`;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
  const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }');
  const fs = sh(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const u = { res: U('uRes'), time: U('uTime'), cell: U('uCell'), light: U('uLight'), mouse: U('uMouse'), mouseOn: U('uMouseOn'),
    trail: U('uTrail'), stars: U('uStars'), planet: U('uPlanet'), deep: U('cDeep'), mid: U('cMid'), glow: U('cGlow'), accent: U('cAccent') };

  const root = document.documentElement;
  const hex = h => { h = h.trim().replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
  const css = n => getComputedStyle(root).getPropertyValue(n);
  const setColors = () => {
    const light = root.dataset.theme === 'light';
    gl.uniform3fv(u.deep, hex(css(light ? '--purple-200' : '--purple-900')));
    gl.uniform3fv(u.mid, hex(css(light ? '--purple-400' : '--purple-600')));
    gl.uniform3fv(u.glow, hex(css(light ? '--purple-600' : '--purple-300')));
    gl.uniform3fv(u.accent, hex(css(light ? '--lime-600' : '--lime-400')));
    gl.uniform1f(u.light, light ? 1 : 0);
  };
  setColors();
  new MutationObserver(setColors).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(host.clientWidth * dpr)), h = Math.max(1, Math.round(host.clientHeight * dpr));
    canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
    gl.uniform2f(u.res, w, h);
    const small = host.clientWidth < 768;
    gl.uniform1f(u.cell, (small ? 6 : SKY.cell) * dpr);
    // no celular o planeta sobe e fica menor, para não ficar atrás do texto
    gl.uniform3f(u.planet, small ? .78 : SKY.planetX, 1 - (small ? .16 : SKY.planetY), small ? .13 : SKY.planetR);
  };
  resize(); addEventListener('resize', resize);

  // mouse / toque
  const target = { x: .7, y: .5 }, mouse = { x: .7, y: .5 };
  let on = 0, onTarget = 0, lastMove = 0;
  const trail = Array.from({ length: TRAIL }, () => [0, 0, 0]);
  const toLocal = (cx, cy) => { const r = host.getBoundingClientRect();
    return (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) ? null : { x: (cx - r.left) / r.width, y: 1 - (cy - r.top) / r.height }; };
  const move = (cx, cy) => { const l = toLocal(cx, cy); if (!l) { onTarget = 0; return; } target.x = l.x; target.y = l.y; onTarget = 1; lastMove = performance.now(); };
  addEventListener('pointermove', e => move(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });

  // clique pendura uma estrela (menos em links e botões)
  const stars = new Float32Array(MAX_STARS * 4); let next = 0;
  host.addEventListener('click', e => {
    if (e.target.closest('a, button, input, label')) return;
    const l = toLocal(e.clientX, e.clientY); if (!l) return;
    stars.set([l.x, l.y, (performance.now() - t0) / 1000, 1], next * 4);
    next = (next + 1) % MAX_STARS;
  });

  let visible = true, raf = 0, stamp = 0;
  const t0 = performance.now(); let last = t0;
  const frame = now => {
    raf = 0;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (now - lastMove > 3000) { // parado: a luz passeia sozinha, bem fraca
      const s = (now - t0) / 1000; target.x = .6 + Math.cos(s * .2) * .25; target.y = .45 + Math.sin(s * .27) * .2; onTarget = .35;
    }
    const k = Math.min(1, dt * 7);
    const px = mouse.x, py = mouse.y;
    mouse.x += (target.x - mouse.x) * k; mouse.y += (target.y - mouse.y) * k; on += (onTarget - on) * k;
    const speed = Math.hypot(mouse.x - px, mouse.y - py);
    if (now - stamp > 45) { stamp = now; trail.pop(); trail.unshift([mouse.x, mouse.y, Math.min(1, speed * 90) * on]); }
    trail.forEach(p => { p[2] *= .95; });
    gl.uniform1f(u.time, (now - t0) / 1000);
    gl.uniform2f(u.mouse, mouse.x, mouse.y);
    gl.uniform1f(u.mouseOn, on);
    gl.uniform3fv(u.trail, new Float32Array(trail.flat()));
    gl.uniform4fv(u.stars, stars);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(host);
  document.addEventListener('visibilitychange', start);
  start();
  root.classList.add('has-nebula');
})();
