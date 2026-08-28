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
const mobileCss = await readFile(new URL('./mobile-presentation.css', import.meta.url), 'utf8');
const mobileSceneTuningCss = await readFile(new URL('./mobile-scene-tuning.css', import.meta.url), 'utf8');

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

html = html.replace('</style>', `\n${mobileCss}\n${mobileSceneTuningCss}\n</style>`);
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
  'Mobile presentation: preserve read mode',
  'Fine-grained mobile composition tuning',
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
