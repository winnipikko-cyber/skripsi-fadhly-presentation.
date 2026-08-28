import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';

const dir = new URL('./parts/', import.meta.url);
const files = (await readdir(dir))
  .filter((name) => /^part-\d+\.txt$/.test(name))
  .sort();

if (files.length !== 8) {
  throw new Error(`Expected 8 presentation source parts, found ${files.length}`);
}

const chunks = await Promise.all(
  files.map((name) => readFile(new URL(name, dir), 'utf8'))
);

const mobilePresentationPatch = `
/* MOBILE PRESENTATION MODE FIX */
@media(max-width:900px){
  body:not(.read-mode){overflow:hidden!important}
  body:not(.read-mode) .progress{display:block!important}
  body:not(.read-mode) .chrome{display:flex!important;inset:auto 12px calc(12px + env(safe-area-inset-bottom))!important}
  body:not(.read-mode) .read-header{display:none!important}
  body:not(.read-mode) .scene{display:none!important;height:100svh!important;min-height:100svh!important;padding:54px 0 78px!important;overflow:auto!important;border-bottom:0!important;align-items:center!important}
  body:not(.read-mode) .scene.active{display:grid!important}
  body.read-mode{overflow:auto!important}
  body.read-mode .progress,body.read-mode .chrome{display:none!important}
  body.read-mode .scene{display:grid!important;height:auto!important;min-height:100svh!important;padding:62px 0!important;overflow:visible!important;border-bottom:1px solid var(--line)!important}
  body.read-mode .read-header{display:flex!important}
  body:not(.read-mode) .scene-status{max-width:58vw;overflow:hidden}
  body:not(.read-mode) .scene-status span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
}
`;

const mobileSwipePatch = `
<script>
(() => {
  let startX = 0, startY = 0;
  const deck = document.getElementById('deck');
  if (!deck) return;
  deck.addEventListener('touchstart', (e) => {
    if (document.body.classList.contains('read-mode') || e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (document.body.classList.contains('read-mode') || !startX) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      document.getElementById(dx < 0 ? 'nextBtn' : 'prevBtn')?.click();
    }
    startX = 0;
    startY = 0;
  }, { passive: true });
})();
</script>
`;

let html = chunks.join('').replace(
  '<meta content="https://skripsi-fadhly.vercel.app" property="og:url"/>',
  '<meta content="https://presentasi-sidang-fadhly.vercel.app" property="og:url"/>'
);

html = html.replace('</style>', `${mobilePresentationPatch}\n</style>`);
html = html.replace('</body>', `${mobileSwipePatch}\n</body>`);

const required = [
  '<!DOCTYPE html>',
  '121104011',
  '69,21%',
  '72,78%',
  'Sidang Skripsi — Fadhly Aziez Jalaluddin',
  'Eksistensi mendahului esensi',
  'https://bad-faith-sidang.vercel.app',
  '<meta content="https://presentasi-sidang-fadhly.vercel.app" property="og:url"/>',
  'MOBILE PRESENTATION MODE FIX',
  "document.getElementById(dx < 0 ? 'nextBtn' : 'prevBtn')?.click()"
];

for (const marker of required) {
  if (!html.includes(marker)) throw new Error(`Missing required marker: ${marker}`);
}

const forbidden = [
  'DecompressionStream',
  '@/' + 'mnt/data',
  '_vercel_share=',
  '<meta content="https://skripsi-fadhly.vercel.app" property="og:url"/>'
];

for (const marker of forbidden) {
  if (html.includes(marker)) throw new Error(`Forbidden runtime marker found: ${marker}`);
}

await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await writeFile(new URL('./dist/index.html', import.meta.url), html, 'utf8');
console.log(`Built direct static presentation: ${html.length} characters`);
