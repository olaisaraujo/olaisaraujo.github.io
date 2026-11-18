# Portfólio olaís — instruções para o Claude

Fale com a Laís em português do Brasil, de forma direta e sem jargão técnico. Ela é designer: explique o que mudou no site, não só no código.

## Regra de publicação (obrigatória)

1. Faça as alterações pedidas no chat e salve só na branch de trabalho (commit + push na branch da sessão). **Nunca** envie para a `main` nem republique o Artifact sem permissão.
2. Ao terminar uma rodada, mostre o resultado (prints) e pergunte: **"Posso publicar?"**
3. Só depois do "sim", rode o teste completo:
   - home e todos os cases carregam sem erro de JavaScript e sem arquivo 404;
   - sem rolagem lateral nem conteúdo cortado em 1440, 1280, 1024, 768 e 390 px;
   - temas claro e escuro, PT e EN.
4. Se o teste passar, publique nos dois lugares:
   - GitHub Pages: `git push origin HEAD:main` (fast-forward);
   - Artifact: republicar `index.html` em https://claude.ai/artifact/Pmqu3pfitwn6WSbdo868JR passando os arquivos alterados em `files`.
5. Se o teste falhar, não publique: explique o problema e corrija antes.

## Projeto

- Site estático em HTML, CSS e JS puros, sem frameworks e sem build.
- Figma: arquivo "Olaís Design - 2026" (file key `kBlv8DfXunFRBHuqsUFd6k`).
- Servidor local: `python3 -m http.server 8000`.
- Cache: depois de mudar CSS ou JS, aumente o `?v=N` nos `<link>` e `<script>` de todas as páginas.
- Textos novos da home precisam de `data-i18n` e tradução em `i18n.js`; nos cases, edite os blocos PT e EN.
- Layout dos cases: `styles/case.css` (prefixo `cs-`). Mídias de cada case em `images/projetos/<case>/`.
