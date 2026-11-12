// olaís — animação do logo na tela de abertura (olá → laís → olaís design)
// Mesma linha do tempo do arquivo "olaís — animação do logo.html", tocando uma vez.
// Uso: window.olaisLogoIntro(svg, onEnd) → devolve { skip() }.
(() => {
  const INK = [244, 244, 238], LIME = [200, 255, 46], MUTE = [139, 139, 132];
  const END = 9.3; // na linha do tempo original o logo termina de sumir em 9.3s
  const SPEED = END / 6; // acelerada para durar 6s no total
  const clamp = x => Math.max(0, Math.min(1, x));
  const p = (t, s, d) => clamp((t - s) / d);
  const outCubic = x => 1 - Math.pow(1 - x, 3);
  const inOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const outBack = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const mix3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
  const mix = (a, b, k) => `rgb(${mix3(a, b, k).map(Math.round).join(',')})`;

  window.olaisLogoIntro = (svg, onEnd) => {
    const el = {};
    ['cam', 'gO', 'gL', 'lRect', 'gA', 'gI', 'gS', 'gAc', 'design', 'cO', 'cLa', 'cComma', 'cLais', 'cLaisLa', 'cLaisIs']
      .forEach(k => el[k] = svg.querySelector('#li-' + k));

    const X = 124, L1 = 152, L2 = 186;
    let wO = 13, wLa = 18, wComma = 6, wLais = 38;
    const measure = () => { try {
      wO = el.cO.getComputedTextLength() || wO; wLa = el.cLa.getComputedTextLength() || wLa;
      wComma = el.cComma.getComputedTextLength() || wComma; wLais = el.cLais.getComputedTextLength() || wLais;
    } catch (e) {} };

    const rise = (node, k, extra = '') => {
      node.setAttribute('transform', `translate(0 ${(1 - outCubic(k)) * 33}) ${extra}`);
      node.setAttribute('opacity', clamp(k * 2.2));
    };

    const render = t => {
      const k2 = inOut(p(t, 2.6, 0.6)), k3 = inOut(p(t, 5.8, 0.7)), kOut = p(t, 8.8, 0.5);
      const cx = lerp(lerp(150.5, 297, k2), 235, k3);
      const settle = 1 - 0.05 * inOut(p(t, 7.5, 0.9));
      el.cam.setAttribute('transform', `translate(400 250) scale(${settle}) translate(${-cx} 0)`);
      el.cam.setAttribute('opacity', 1 - inOut(kOut));

      const oBack = k2 * (1 - k3);
      rise(el.gO, p(t, 0.3, 0.55), `translate(${-7 * oBack} 0)`);
      el.gO.setAttribute('opacity', clamp(p(t, 0.3, 0.55) * 2.2) * lerp(1, 0.16, oBack));
      el.gO.setAttribute('fill', mix(INK, INK, 0));

      const laCol = mix(INK, LIME, p(t, 2.6, 0.4) * (1 - p(t, 5.8, 0.5)));
      rise(el.gL, p(t, 0.5, 0.55)); rise(el.gA, p(t, 0.7, 0.55));
      el.gL.setAttribute('fill', laCol); el.gA.setAttribute('fill', laCol);

      el.lRect.setAttribute('height', 59.74 + 24.5 * outCubic(p(t, 2.85, 0.25)));
      el.lRect.setAttribute('width', 20.7 + 143 * inOut(p(t, 3.05, 0.7)));

      rise(el.gI, p(t, 3.3, 0.5)); rise(el.gS, p(t, 3.5, 0.5));
      el.gI.setAttribute('fill', mix(INK, INK, 0)); el.gS.setAttribute('fill', mix(INK, INK, 0));

      const drop = p(t, 1.25, 0.45), hop = p(t, 3.95, 0.5);
      const ax = 41.4 * inOut(hop);
      const ay = -(1 - outBack(drop)) * 42 - Math.sin(Math.PI * hop) * 21;
      el.gAc.setAttribute('transform', `translate(${ax} ${ay}) rotate(${Math.sin(Math.PI * hop) * -14} 116.4 7.2)`);
      el.gAc.setAttribute('opacity', clamp(drop * 4));
      el.gAc.setAttribute('fill', mix(INK, INK, 0));

      // legendas (ficam ocultas, como no arquivo original)
      const c1 = outCubic(p(t, 1.6, 0.4)), c2 = outCubic(p(t, 4.2, 0.45)), m = inOut(p(t, 6.0, 0.7));
      const capLime = c2 * (1 - p(t, 5.8, 0.5)), joinX = X + wLa + wComma + 7;
      el.cO.setAttribute('x', X); el.cO.setAttribute('y', L1 + (1 - c1) * 10);
      el.cLa.setAttribute('x', X); el.cLa.setAttribute('y', L1 + (1 - c1) * 10);
      el.cO.setAttribute('opacity', c1); el.cLa.setAttribute('opacity', c1);
      el.cO.setAttribute('fill', mix(MUTE, INK, m * 0.6));
      el.cLa.setAttribute('fill', mix(mix3(MUTE, INK, m * 0.6), LIME, capLime));
      el.cComma.setAttribute('x', X + wLa); el.cComma.setAttribute('y', L1); el.cComma.setAttribute('opacity', m);
      el.cLais.setAttribute('x', lerp(X, joinX, m)); el.cLais.setAttribute('y', lerp(L2, L1, m) + (1 - c2) * 10);
      el.cLais.setAttribute('opacity', c2);

      const d = outCubic(p(t, 6.35, 0.6));
      el.design.setAttribute('transform', `translate(0 ${(1 - d) * 18})`);
      el.design.setAttribute('opacity', d);
      el.design.setAttribute('fill', mix(LIME, LIME, 0));
    };

    let start = null, done = false, raf = 0;
    const finish = () => { if (done) return; done = true; cancelAnimationFrame(raf); onEnd && onEnd(); };
    const frame = now => {
      if (start == null) start = now;
      const t = Math.min((now - start) / 1000 * SPEED, END);
      render(t);
      if (t >= 8.9) return finish(); // a tela começa a subir enquanto o logo some
      raf = requestAnimationFrame(frame);
    };
    measure(); render(0);
    raf = requestAnimationFrame(frame);
    return { skip: finish };
  };
})();
