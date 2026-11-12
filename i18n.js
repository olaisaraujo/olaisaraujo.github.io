// olaís — troca de idioma PT / EN (sem dependências)
// Como usar: coloque data-i18n="chave" no elemento e a tradução em EN abaixo.
// O texto em português é o que já está no HTML; se faltar uma chave em EN, fica em PT.
(() => {
  const EN = {
    'doc.title': 'Laís Araujo — Product Designer | UX/UI',
    'skip': 'Skip to content',
    'intro.skip': 'skip intro',
    'nav.about': 'about',
    'nav.projects': 'projects',
    'nav.feedbacks': 'feedback',
    'nav.contact': 'contact',
    'nav.talk': "let's talk",
    'hero.hello': "hi, I'm Laís",
    'hero.title': 'Welcome to my design universe, where every pixel has <span class="highlight">a purpose</span>.',
    'hero.projects': 'projects',
    'hero.cv': 'view résumé',
    'rest.phrase': '<span class="highlight">Breathe.</span> Great products are born from great questions.',
    'rest.cta': 'see projects',
    'projects.overline': 'Projects',
    'projects.title': 'Featured projects',
    'case.foot.overline': 'Contact',
    'case.foot.title': 'Shall we create something together?',
    'logos.label': 'companies and brands I’ve worked with',
    'cta.overline': "Contact",
    'cta.title': "So, shall we work together?",
    'cta.text': "Less formality, more conversation. Let’s chat about your product or your open role.",
    'cta.btn': "open WhatsApp",
    'cta.phrase': "Design is about people.<br> <span class=\"highlight\">Every pixel</span> has a<br> <span class=\"brand\">purpose</span>.",
    'foot.cv': "Résumé",
    'foot.note': "made with love by the designer who owns this portfolio",
    'gallery.overline': 'Behind the screens',
    'gallery.title': 'A bit of me outside Figma',
    'testi.overline': "Feedback",
    'testi.title': "What people say about my work",
    'testi.sub': "Leaders and teammates, in their own words, on what changed after we worked together.",
    'num.years': "years of experience",
    'num.sectors': "industries",
    'num.products': "digital products",
    'testi.pill': "People I worked with",
    'testi.badge': "Zamp · Burger King & Popeyes",
    'testi.role1': "Product Manager · Zamp (Burger King & Popeyes)",
    'testi.role2': "UX Coordinator · Zamp",
    'testi.role3': "Visual Design Lead · Zamp",
    'process.1.title': "Understand the problem",
    'process.1.text': "I start by aligning with product, engineering and business on what needs to change and how we’ll know it worked. Before opening Figma, I review data, past research and technical constraints.",
    'process.2.title': "Research and explore",
    'process.2.text': "I talk to users and stakeholders, benchmark and map the flows to see the whole problem. The goal is to arrive with well-grounded options, not a single answer.",
    'process.3.title': "Design and validate",
    'process.3.text': "I move from wireframes to high-fidelity prototypes in the design system, writing the interface copy alongside the layout. I test with users and iterate with the team before closing the solution.",
    'process.4.title': "Deliver and follow up",
    'process.4.text': "I document states, rules and edge cases for a noise-free handoff. Then I follow the implementation and results to decide the next steps.",
    'process.overline': "How I work",
    'process.heading': "My design process",
    'card.cta': 'view case',
    'card.goper.tag1': 'Product 0→1',
    'card.goper.title': 'The gym that fits your routine',
    'card.goper.desc': 'First designer at the company: a fitness ecosystem built from scratch during the pandemic, for trainers and students.',
    'card.bk.tag0': "Self-service",
    'card.bk.tag1': "Research",
    'card.bk.tag2': "Retail",
    'card.bk.title': "A new menu for the kiosk",
    'card.bk.desc': "Card sorting and a linear flow that cut 10s per order and raised the average ticket by 9.1%.",
    'card.mis.title': "MIS Communities",
    'card.mis.desc': "A feature built from scratch for brands and creators: +519% engagement in Dove’s community.",
    'card.feed.tag1': "A/B test",
    'card.feed.title': "Anonymous preview feed",
    'card.feed.desc': "Watch before logging in: an invite at the right moment against 75% drop-off before the 1st video.",
    'card.ge.tag0': "Data & AI",
    'card.ge.tag1': "Sports",
    'card.ge.title': "Athlete card & Did you know?",
    'card.ge.desc': "Data and AI in live coverage: one card shipped and one bet validated (and paused) before development.",
    'card.novelinhas.tag0': "Retention",
    'card.novelinhas.tag1': "Vertical video",
    'card.novelinhas.title': "Microdramas & Soaps",
    'card.novelinhas.desc': "Order, memory and continuity for vertical series: ep. 2 had 1% of views and ep. 7 had 33%.",
    'about.overline': 'About',
    'about.title': 'Experience in products people use every day.',
    'about.cv': 'view full résumé',
    'cv.globopop.per': "01/2026 · present",
    'cv.globopop.desc': "Launch of GloboPop: Communities (UGC), username from onboarding to profile and a Figma plugin that automates handoff.",
    'cv.ge.desc': "AI in live broadcasts: “Did you know?” insights and real-time match summaries to keep viewers engaged.",
    'cv.mis.role': "Senior Product Designer",
    'cv.mis.per': "08/2024 · 12/2024<br>04/2026 · 09/2026",
    'cv.mis.desc': "Creator communities in the MIS app and brand management in SIC — already used by Pantene, Dove and Cetaphil.",
    'cv.omie.role': "Senior UX Designer Analyst",
    'cv.omie.desc': "UX and CRO in Growth: a design system that cut landing page SLA by 40% and a sign-up flow with +100 bookings.",
    'cv.zamp.co': "Zamp · Burger King & Popeyes",
    'cv.zamp.desc': "Self-service kiosks: +28% in sales, +9.1% average ticket and +15 p.p. transactional NPS.",
    'cv.goper.desc': "Built the design area from scratch: UX/UI processes, user research, visual identity and design system.",
  };

  // Rótulos para leitor de tela (aria-label): textos fixos e padrões numerados
  const LABELS = {
    'Principal': 'Main', 'Idioma / Language': 'Language', 'Alternar tema': 'Toggle theme', 'Atalhos': 'Shortcuts',
    'Empresas onde trabalhei': 'Companies I worked with', 'Experiência profissional': 'Work experience',
    'Depoimentos': 'Testimonials', 'Depoimento anterior': 'Previous testimonial', 'Próximo depoimento': 'Next testimonial',
    'Galeria de fotos': 'Photo gallery', 'Foto anterior': 'Previous photo', 'Próxima foto': 'Next photo',
    'Fotos pessoais': 'Personal photos', 'Respira': 'Breathe', 'olaís — início': 'olaís — home',
    'Neste estudo de caso': 'In this case study',
  };
  const labelEN = l => LABELS[l] || l.replace(/^Foto (\d+)$/, 'Photo $1').replace(/^Depoimento (\d+)$/, 'Testimonial $1').replace(/^(\d+) de (\d+)$/, '$1 of $2');
  const labelled = [...document.querySelectorAll('[aria-label]')].filter(el => !el.hasAttribute('data-i18n'));
  labelled.forEach(el => { el.dataset.labelPt = el.getAttribute('aria-label'); });

  const root = document.documentElement;
  const nodes = [...document.querySelectorAll('[data-i18n]')];
  const PT = new Map(nodes.map(el => [el, el.innerHTML]));
  const ptTitle = document.title;
  const skip = document.querySelector('.skip-link'); const ptSkip = skip?.textContent;

  const apply = (lang, announce) => {
    const en = lang === 'en';
    root.lang = en ? 'en' : 'pt-BR';
    nodes.forEach(el => {
      const html = en && EN[el.dataset.i18n] != null ? EN[el.dataset.i18n] : PT.get(el);
      if (el.innerHTML !== html) { el.innerHTML = html; el.removeAttribute('aria-label'); }
    });
    labelled.forEach(el => el.setAttribute('aria-label', en ? labelEN(el.dataset.labelPt) : el.dataset.labelPt));
    // páginas de estudo de caso: o conteúdo inteiro existe nos dois idiomas, em blocos
    document.querySelectorAll('[data-lang-block]').forEach(b => { b.hidden = b.dataset.langBlock !== (en ? 'en' : 'pt'); });
    root.classList.toggle('lang-en', en);
    document.title = en ? (root.dataset.titleEn || EN['doc.title']) : ptTitle;
    if (skip) skip.textContent = en ? EN.skip : ptSkip;
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (announce) document.dispatchEvent(new CustomEvent('olais:lang', { detail: { lang } }));
  };

  let lang = 'pt';
  try { lang = localStorage.getItem('lang') || 'pt'; } catch {}
  apply(lang, false);

  document.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click', () => {
    lang = btn.dataset.lang;
    try { localStorage.setItem('lang', lang); } catch {}
    apply(lang, true);
  }));
})();
