# overuju.cz – statický web

Sestavený výstup z hlavního (soukromého) repozitáře Ověřuju (`apps/public-web`, `npm run prerender`).
Neupravujte ručně – změny dělejte ve zdrojích a znovu sestavte.

- `data/coi-rizikove.json` – seznam rizikových e-shopů České obchodní inspekce (otevřená data), denně obnovuje
  workflow `.github/workflows/refresh-coi.yml`.
- Kontrola obchodu probíhá přímo v prohlížeči; zadaná adresa nikam neodchází.
