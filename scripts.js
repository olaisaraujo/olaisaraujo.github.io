// olaís portfolio — interações leves (sem dependências)
(() => {
  const root = document.documentElement;

  // Tema claro/escuro (lembra a escolha do visitante)
  const stored = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  if (stored) root.dataset.theme = stored;
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch {}
      btn.setAttribute('aria-label', next === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro');
    });
  });

  // Ano no rodapé
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Animação de entrada
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));

  // Faixa de empresas: logos surgem um a um ao entrar na tela
  document.querySelectorAll('[data-logos]').forEach(el => {
    if (!('IntersectionObserver' in window)) { el.classList.add('is-in'); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
  });

  // Destaca o item ativo no menu flutuante e no índice do estudo de caso
  const spy = (links) => {
    const map = new Map([...links].map(a => [document.querySelector(a.getAttribute('href').replace(/^.*#/, '#')), a]).filter(([s]) => s));
    if (!map.size || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { links.forEach(l => l.classList.remove('is-active')); map.get(e.target)?.classList.add('is-active'); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, section) => io.observe(section));
  };
  spy(document.querySelectorAll('.menu-toggle a[href*="#"]'));
  spy(document.querySelectorAll('.case-toc a'));

  // Formulário de contato: abre o e-mail do visitante já preenchido
  const form = document.querySelector('[data-contact-form]');
  if (form) form.addEventListener('submit', ev => {
    ev.preventDefault();
    const email = form.querySelector('#email');
    const helper = form.querySelector('#email-helper');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    email.setAttribute('aria-invalid', String(!ok));
    helper.textContent = ok ? 'Respondo em até 2 dias úteis' : 'Digite um e-mail válido';
    helper.classList.toggle('field__helper--error', !ok);
    if (!ok) { email.focus(); return; }
    const name = form.querySelector('#name').value.trim();
    const msg = form.querySelector('#message').value.trim();
    const body = `${msg}\n\n— ${name} (${email.value.trim()})`;
    window.location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent('Contato pelo portfólio' + (name ? ' — ' + name : ''))}&body=${encodeURIComponent(body)}`;
  });

  /* ======================================================================
     Motion: abertura, título, scroll (vitrine, texto, projetos), contadores
     ====================================================================== */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const ready = () => root.classList.add('is-ready');

  // Quebra o texto em palavras sem perder os <span> de destaque
  const splitWords = (el, cls) => {
    const words = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = cls;
          if (cls === 'split-word') { const inner = document.createElement('span'); inner.textContent = part; w.append(inner); }
          else w.textContent = part;
          frag.append(w); words.push(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    words.forEach(w => w.setAttribute('aria-hidden', 'true'));
    return words;
  };

  document.querySelectorAll('[data-split]').forEach(el => splitWords(el, 'split-word').forEach((w, i) => w.style.setProperty('--w', i)));
  // ao trocar o idioma, o título é quebrado em palavras de novo
  document.addEventListener('olais:lang', () => document.querySelectorAll('[data-split]').forEach(el => {
    if (!el.querySelector('.split-word')) splitWords(el, 'split-word').forEach((w, i) => w.style.setProperty('--w', i));
  }));
  document.addEventListener('olais:lang', () => {
    scrubs.forEach(sc => { if (!sc.el.querySelector('.scrub-word')) sc.words = splitWords(sc.el, 'scrub-word'); });
    if (reduce) scrubs.forEach(({ words }) => words.forEach(w => w.classList.add('is-on')));
    schedule();
  });

  // Tela de abertura: animação do logo (olá → laís → olaís design), depois a tela sobe.
  // Só na primeira visita da sessão; clique, Esc ou "pular intro" encerram antes.
  const pre = document.querySelector('[data-preloader]');
  let seen = false; try { seen = sessionStorage.getItem('olais-intro') === '1'; } catch {}
  const svg = pre?.querySelector('.logo-intro__svg');
  if (pre && svg && window.olaisLogoIntro && !reduce && !seen) {
    root.classList.add('is-loading');
    const end = () => {
      pre.classList.add('is-done'); root.classList.remove('is-loading');
      try { sessionStorage.setItem('olais-intro', '1'); } catch {}
      setTimeout(ready, 250);
      pre.addEventListener('transitionend', () => pre.classList.add('is-gone'), { once: true });
      removeEventListener('keydown', onKey);
    };
    const intro = window.olaisLogoIntro(svg, end);
    const onKey = e => { if (e.key === 'Escape') intro.skip(); };
    pre.addEventListener('click', () => intro.skip());
    addEventListener('keydown', onKey);
  } else {
    pre?.classList.add('is-gone');
    requestAnimationFrame(ready);
  }

  // Cards de projeto: o brilho roxo acompanha o mouse dentro do card
  document.querySelectorAll('[data-tilt]').forEach(card => {
    const inner = card.querySelector('.project-card__inner');
    card.addEventListener('pointermove', e => {
      const r = inner.getBoundingClientRect();
      inner.style.setProperty('--mx', `${e.clientX - r.left}px`);
      inner.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // Números que giram: "+7" vira colunas de 0–9 que param no dígito certo
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach((el, n) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((ch, i) => {
      if (!/\d/.test(ch)) { const s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden', 'true'); el.append(s); return; }
      const roll = document.createElement('span'); roll.className = 'roll'; roll.setAttribute('aria-hidden', 'true');
      const col = document.createElement('span'); col.className = 'roll__col';
      for (let k = 0; k < 20; k++) { const d = document.createElement('span'); d.textContent = k % 10; col.append(d); }
      col.style.setProperty('--to', 10 + Number(ch));
      col.style.setProperty('--d', `${n * .15 + i * .1}s`);
      roll.append(col); el.append(roll);
    });
  });
  // cada coluna do contador fica com a largura do número final (sem espaço sobrando no "1")
  const fitRolls = () => document.querySelectorAll('.roll').forEach(r => {
    const col = r.firstElementChild, to = Number(col.style.getPropertyValue('--to'));
    const w = col.children[to]?.getBoundingClientRect().width; if (w) r.style.width = `${Math.ceil(w)}px`;
  });
  (document.fonts?.ready || Promise.resolve()).then(fitRolls);
  addEventListener('resize', fitRolls);
  if (counters.length) {
    const box = counters[0].closest('.numbers') || counters[0].parentElement;
    if ('IntersectionObserver' in window && !reduce) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { box.classList.add('is-counted'); io.disconnect(); } }, { threshold: .5 });
      io.observe(box);
    } else box.classList.add('is-counted');
  }

  // Texto que acende palavra a palavra
  const scrubs = [...document.querySelectorAll('[data-scrub]')].map(el => ({ el, words: splitWords(el, 'scrub-word') }));

  const reel = document.querySelector('[data-reel]');
  const hs = document.querySelector('[data-hscroll]');
  const track = hs?.querySelector('[data-hscroll-track]');
  const hsCards = track ? [...track.children] : [];
  const hsCount = document.querySelector('[data-hscroll-count]');
  const hsBar = document.querySelector('[data-hscroll-bar]');
  const pad = n => String(n).padStart(2, '0');
  const total = document.querySelector('[data-hscroll-total]'); if (total) total.textContent = pad(hsCards.length);
  const desktop = window.matchMedia('(min-width: 961px)');
  let hsDist = 0;

  const layoutHs = () => {
    if (!hs || !track) return;
    const on = desktop.matches && !reduce;
    hs.classList.toggle('is-active', on);
    if (!on) { hs.style.height = ''; track.style.removeProperty('--x'); return; }
    hsDist = Math.max(0, track.scrollWidth - window.innerWidth);
    hs.style.height = `${window.innerHeight + hsDist}px`;
  };

  const gallery = [...document.querySelectorAll('[data-gallery] .gallery__photo')];
  const timelines = [...document.querySelectorAll('[data-timeline]')];
  if (reduce) timelines.forEach(tl => tl.querySelectorAll('.cv__item').forEach(it => it.classList.add('is-in')));
  const header = document.querySelector('.site-header');
  let lastY = window.scrollY;

  const onScroll = () => {
    const vh = window.innerHeight, y = window.scrollY;

    // header some descendo, volta subindo
    header?.classList.toggle('is-scrolled', y > 40);
    if (header && !reduce) {
      header.classList.toggle('is-hidden', y > lastY && y > 160);
      lastY = y;
    }
    if (reduce) return;

    if (reel) {
      const r = reel.getBoundingClientRect();
      reel.style.setProperty('--p', clamp01(-r.top / (r.height - vh)).toFixed(4));
    }

    scrubs.forEach(({ el, words }) => {
      const r = el.getBoundingClientRect();
      // termina aceso a 30% da tela ou, se a página acabar antes, no fim da rolagem
      const maxY = document.documentElement.scrollHeight - vh;
      const start = vh * .85, end = Math.min(start - 1, Math.max(vh * .3, r.top - (maxY - y)));
      const p = clamp01((start - r.top) / (start - end));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
    });

    // linha do tempo do currículo: a linha cresce e cada item acende ao chegar
    timelines.forEach(tl => {
      const r = tl.getBoundingClientRect();
      tl.style.setProperty('--tl', clamp01((vh * .72 - r.top) / r.height).toFixed(4));
      tl.querySelectorAll('.cv__item').forEach(it => { if (it.getBoundingClientRect().top < vh * .78) it.classList.add('is-in'); });
    });

    // galeria: cada foto anda num ritmo diferente (parallax leve)
    gallery.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const c = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.setProperty('--py', `${(-c * (i % 2 ? 40 : 22)).toFixed(1)}px`);
    });

    if (hs?.classList.contains('is-active')) {
      const r = hs.getBoundingClientRect();
      const p = hsDist ? clamp01(-r.top / hsDist) : 0;
      track.style.setProperty('--x', `${-p * hsDist}px`);
      if (hsBar) hsBar.style.setProperty('--hp', (1 + p * (hsCards.length - 1)) / hsCards.length);
      if (hsCount) hsCount.textContent = pad(Math.min(hsCards.length, Math.round(p * (hsCards.length - 1)) + 1));
    }
  };

  // celular: contador acompanha o deslize com o dedo
  track?.addEventListener('scroll', e => {
    if (hs.classList.contains('is-active')) return;
    const sc = e.currentTarget, max = sc.scrollWidth - sc.clientWidth;
    const p = max ? sc.scrollLeft / max : 0;
    if (hsBar) hsBar.style.setProperty('--hp', (1 + p * (hsCards.length - 1)) / hsCards.length);
    if (hsCount) hsCount.textContent = pad(Math.round(p * (hsCards.length - 1)) + 1);
  }, { passive: true });

  let raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; onScroll(); }); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { layoutHs(); schedule(); });
  desktop.addEventListener?.('change', () => { layoutHs(); schedule(); });
  window.addEventListener('load', () => { layoutHs(); schedule(); });
  layoutHs(); onScroll();
  if (reduce) scrubs.forEach(({ words }) => words.forEach(w => w.classList.add('is-on')));

  // Depoimentos: carrossel com troca automática (o tracinho ativo enche e passa para o próximo)
  document.querySelectorAll('[data-testimonials]').forEach(sl => {
    const slides = [...sl.querySelectorAll('.testi__slide')], imgs = [...sl.querySelectorAll('.testi__img')], dots = [...sl.querySelectorAll('.testi__dot')];
    if (slides.length < 2) return;
    let idx = 0;
    const go = n => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => { s.classList.toggle('is-active', i === idx); s.toggleAttribute('aria-hidden', i !== idx); });
      imgs.forEach((im, i) => im.classList.toggle('is-active', i === idx));
      dots.forEach((d, i) => { d.classList.remove('is-active'); d.removeAttribute('aria-current'); });
      void dots[idx].offsetWidth; // reinicia a animação do tracinho
      dots[idx].classList.add('is-active'); dots[idx].setAttribute('aria-current', 'true');
    };
    dots.forEach((d, i) => { d.addEventListener('click', () => go(i)); d.querySelector('span').addEventListener('animationend', () => go(idx + 1)); });
    sl.querySelector('.testi__prev')?.addEventListener('click', () => go(idx - 1));
    sl.querySelector('.testi__next')?.addEventListener('click', () => go(idx + 1));
    sl.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(idx - 1); if (e.key === 'ArrowRight') go(idx + 1); });
    // pausa com o mouse em cima, com foco dentro ou fora da tela
    let hover = false, focus = false, inView = false;
    const sync = () => sl.classList.toggle('is-paused', hover || focus || !inView);
    sl.addEventListener('mouseenter', () => { hover = true; sync(); }); sl.addEventListener('mouseleave', () => { hover = false; sync(); });
    sl.addEventListener('focusin', () => { focus = true; sync(); }); sl.addEventListener('focusout', () => { focus = false; sync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: .3 }).observe(sl); else { inView = true; }
    sync();
    // arrastar para o lado no celular
    let x0 = null;
    sl.addEventListener('pointerdown', e => { x0 = e.clientX; });
    sl.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1)); });
  });

  // Galeria em arco: a foto do meio fica em destaque e as outras se abrem em leque; troca sozinha a cada 3s
  document.querySelectorAll('[data-arc]').forEach(arc => {
    const items = [...arc.querySelectorAll('.arc__item')], dots = [...arc.querySelectorAll('.arc__dot')], n = items.length;
    if (!n) return;
    let idx = Math.floor(n / 2), timer = 0, paused = false;
    const render = () => items.forEach((it, i) => {
      let d = i - idx; if (d > n / 2) d -= n; if (d < -n / 2) d += n; // caminho mais curto, em loop
      const ad = Math.abs(d);
      it.style.setProperty('--d', d); it.style.setProperty('--ad', ad); it.style.setProperty('--o', ad > 4 ? 0 : 1);
      it.classList.toggle('is-active', d === 0);
      it.setAttribute('aria-hidden', String(d !== 0));
      dots[i]?.classList.toggle('is-active', d === 0);
      dots[i]?.toggleAttribute('aria-current', d === 0);
    });
    const go = k => { idx = (k + n) % n; render(); restart(); };
    const restart = () => { clearInterval(timer); if (!reduce && !paused) timer = setInterval(() => { idx = (idx + 1) % n; render(); }, 3000); };
    arc.querySelector('.arc__prev').addEventListener('click', () => go(idx - 1));
    arc.querySelector('.arc__next').addEventListener('click', () => go(idx + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    items.forEach((it, i) => it.addEventListener('click', () => { if (i !== idx) go(i); }));
    arc.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(idx - 1); if (e.key === 'ArrowRight') go(idx + 1); });
    // passa sozinha o tempo todo (também com o mouse em cima); só para quando sai da tela
    // arrastar / deslizar
    let x0 = null;
    const stage = arc.querySelector('.arc__stage');
    stage.addEventListener('pointerdown', e => { x0 = e.clientX; });
    addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { paused = !e.isIntersecting; restart(); }).observe(arc);
    render(); restart();
  });

  // Estudo de caso: carrossel de fotos "em campo" (arrastar com o mouse ou o dedo; pontos acompanham)
  document.querySelectorAll('[data-cs-carousel]').forEach(car => {
    const track = car.querySelector('.cs-carousel__track'), dotsBox = car.querySelector('.cs-carousel__dots');
    const slides = [...track.children];
    const dots = slides.map((sl, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'cs-dot';
      b.setAttribute('aria-label', `${i + 1} / ${slides.length}`);
      b.addEventListener('click', () => track.scrollTo({ left: sl.offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' }));
      dotsBox.append(b); return b;
    });
    dotsBox.style.display = 'flex'; dotsBox.style.gap = '8px';
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      let i = slides.findIndex(sl => sl.offsetLeft - track.offsetLeft >= track.scrollLeft - 4);
      if (track.scrollLeft >= max - 4) i = slides.length - 1;
      dots.forEach((d, k) => { d.classList.toggle('is-active', k === Math.max(0, i)); d.toggleAttribute('aria-current', k === i); });
    };
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    let x0 = null, s0 = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; x0 = e.clientX; s0 = track.scrollLeft; moved = false; track.classList.add('is-dragging'); });
    addEventListener('pointermove', e => { if (x0 == null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; track.scrollLeft = s0 - dx; });
    addEventListener('pointerup', () => { if (x0 == null) return; x0 = null; track.classList.remove('is-dragging'); });
    track.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
    sync();
  });
})();
