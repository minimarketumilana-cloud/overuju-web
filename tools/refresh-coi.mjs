// Denní obnova seznamu rizikových e-shopů ČOI pro statickou verzi overuju.cz.
// Bez závislostí. Parsování odpovídá packages/integrations/src/coi-risk-list.ts v hlavním repozitáři.
// Licence otevřených dat ČOI dovoluje použití srovnávačům k ochraně spotřebitelů.
import { writeFileSync } from 'node:fs';

const URL = 'https://coi.gov.cz/userdata/files/dokumenty-ke-stazeni/open-data/rizikove-seznam.csv';
const response = await fetch(URL, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) throw new Error(`ČOI: HTTP ${response.status}`);
const bytes = new Uint8Array(await response.arrayBuffer());

let text;
try {
  text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
} catch {
  text = new TextDecoder('windows-1250').decode(bytes);
}

const entries = {};
for (const line of text.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  const separator = trimmed.indexOf(';');
  const rawHost = (separator === -1 ? trimmed : trimmed.slice(0, separator)).trim().replace(/^https?:\/\//i, '').split('/')[0] ?? '';
  const reason = separator === -1 ? '' : trimmed.slice(separator + 1).trim().replace(/^'|'$/g, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(rawHost)) continue;
  let host = rawHost.toLowerCase().replace(/\.$/, '');
  if (host.startsWith('www.')) host = host.slice(4);
  entries[host] = reason;
}

const count = Object.keys(entries).length;
if (count < 100) throw new Error(`Seznam má podezřele málo záznamů (${count}) – nepublikuji.`);

writeFileSync(
  'data/coi-rizikove.json',
  JSON.stringify({
    source: 'Česká obchodní inspekce – Rizikové weby (otevřená data)',
    sourceUrl: 'https://coi.gov.cz/pro-spotrebitele/rizikove-e-shopy/',
    fetchedAt: new Date().toISOString(),
    count,
    entries,
  }),
);
console.log(`ČOI: ${count} záznamů`);
