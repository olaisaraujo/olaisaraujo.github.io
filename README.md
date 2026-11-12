# Portfólio — Laís Araujo (olaís)

Site estático em HTML/CSS/JS, sem dependências. Visual 100% baseado no design system do Figma.

## Estrutura
- `index.html` — home, nesta ordem: 1. Hero · 2. Empresas que trabalhei · 3. Dobra de descanso com frase · 4. Sobre + mini currículo · 5. Projetos em destaque · 6. Meu processo de design · 7. Prova social + números · 8. Galeria de fotos pessoais em arco (`images/galeria/foto-01…12.webp`) · 9. Última chamada para contato + frase · 10. Footer
- `projetos/` — estudos de caso: `burger-king-totem`, `mis-comunidades`, `globopop-feed-anonimo`, `ge-card-de-atleta`, `globopop-novelinhas`, `goper` (textos tirados dos decks do Figma). `zamp.html` é a versão antiga, sem link na home.
- `images/projetos/` — imagens provisórias exportadas do Figma (`card-*.jpg` são as capas dos cards da home)
- `styles/tokens.css` — tokens do Figma (cores Dark/Light, espaçamento, raios, tipografia, efeitos)
- `styles/main.css` — componentes (Button, Tag, Link, Project Card, Menu Toggle, Input, Metric…)
- `styles/motion.css` + final do `scripts.js` — animações: tela de abertura, título palavra a palavra, vitrine em círculo, texto que acende no scroll, números que giram, projetos na horizontal e processo empilhado. Quem ativa "reduzir movimento" no sistema vê tudo parado.
- `assets/` — logo, formas, ícones (`icons.svg`) e currículo
- `images/` — coloque aqui os mockups e sua foto

## O que falta preencher
Tudo que tem contorno laranja tracejado (classe `todo`) é conteúdo de exemplo:
1. Fotos/mockups: `images/zamp-capa.jpg`, `images/goper-capa.jpg`, `images/lais.jpg` e as imagens dos estudos de caso (os comentários no HTML mostram onde trocar).
2. Números reais nas métricas (`−XX%`, `+XX%`) e os textos de Problema e Aprendizados.
3. ✅ Currículo em `assets/curriculo-lais-araujo.pdf` (versão 2026). Ao atualizar o PDF, revise o mini currículo da dobra Sobre.
4. ✅ WhatsApp: `wa.me/5511966239797` (menu e última dobra do `index.html`).
5. Logos das empresas: salve em `assets/logos/` e troque os nomes em texto da faixa "empresas".
6. ✅ Depoimentos (Zamp) e números (+9, 6, +15).
Depois de trocar, remova a classe `todo` do elemento.

Para colocar um vídeo ou imagem na vitrine (o círculo roxo), siga o comentário dentro de `<section class="reel">` no `index.html`.

Idioma PT/EN: os textos em inglês ficam em `i18n.js`. Para traduzir um texto novo, coloque `data-i18n="chave"` no elemento e adicione a chave em `EN`.

Foto em silhueta do hero: salve um PNG com fundo transparente em `images/lais-silhueta.png` e descomente a linha indicada no `index.html`.

Fundo do hero: `nebula.js` (universo em pixels). Para mover o planeta ou mudar o tamanho dos pontos, ajuste `SKY` no topo do arquivo. A fumaça roxa da dobra de descanso e o anel do cursor ficam em `fluid.js`.

## Rodar localmente
```bash
python3 -m http.server 8000
```
Abra http://localhost:8000

## Publicar no GitHub Pages
A pasta já está pronta: repositório Git na branch `main`, `.nojekyll` (o GitHub serve os arquivos como estão), `404.html` e `.gitignore` (deixa de fora `.claude/` e `.DS_Store`). Todos os caminhos são relativos, então o site funciona em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

1. Crie um repositório **público** e vazio em https://github.com/new (sem README).
2. Envie os arquivos (troque a URL pela do seu repositório):
   ```bash
   git commit -m "Portfólio olaís"
   git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
   git push -u origin main
   ```
3. No repositório: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save**. Em 1–2 minutos o site aparece no endereço mostrado ali.

Para atualizar depois: `git add -A && git commit -m "atualização" && git push`.
