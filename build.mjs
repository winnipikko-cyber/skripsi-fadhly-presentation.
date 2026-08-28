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
  body:not(.read-mode) .scene{display:none!important;height:100svh!important;min-height:100svh!important;padding:46px 0 86px!important;overflow:auto!important;border-bottom:0!important;align-items:center!important;overscroll-behavior:contain}
  body:not(.read-mode) .scene.active{display:grid!important}
  body.read-mode{overflow:auto!important}
  body.read-mode .progress,body.read-mode .chrome{display:none!important}
  body.read-mode .scene{display:grid!important;height:auto!important;min-height:100svh!important;padding:62px 0!important;overflow:visible!important;border-bottom:1px solid var(--line)!important}
  body.read-mode .read-header{display:flex!important}
  body:not(.read-mode) .scene-status{max-width:58vw;overflow:hidden}
  body:not(.read-mode) .scene-status span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
}

/* MOBILE PRESENTATION COMPACT LAYOUT */
@media(max-width:560px){
  body:not(.read-mode) .scene{padding:28px 0 84px!important;align-items:start!important}
  body:not(.read-mode) .wrap{width:calc(100% - 28px)!important}
  body:not(.read-mode) .eyebrow{font-size:9px!important;margin-bottom:8px!important;gap:8px!important;letter-spacing:.1em!important}
  body:not(.read-mode) .eyebrow:before{width:24px!important}
  body:not(.read-mode) h1{font-size:35px!important;line-height:1!important;margin-bottom:12px!important}
  body:not(.read-mode) h2{font-size:27px!important;line-height:1.06!important;margin-bottom:10px!important;letter-spacing:-.035em!important}
  body:not(.read-mode) h3{font-size:18px!important;margin-bottom:6px!important}
  body:not(.read-mode) .lead{font-size:15px!important;line-height:1.35!important}
  body:not(.read-mode) .source{font-size:9px!important;line-height:1.3!important;margin-top:7px!important}
  body:not(.read-mode) .rule{margin:10px 0!important}

  body:not(.read-mode) .cover-meta{margin-top:16px!important;gap:4px!important;font-size:11px!important}
  body:not(.read-mode) .term-row{margin-top:12px!important;gap:5px!important}
  body:not(.read-mode) .term{padding:5px 7px!important;font-size:10px!important}
  body:not(.read-mode) .visual-note{padding-left:12px!important}
  body:not(.read-mode) .visual-note p{font-size:19px!important;line-height:1.25!important}

  body:not(.read-mode) .empirical{gap:10px!important}
  body:not(.read-mode) .chart-card{padding:12px 14px 10px!important}
  body:not(.read-mode) .chart-title{font-size:9.5px!important;margin-bottom:8px!important}
  body:not(.read-mode) .bar-chart{height:145px!important;gap:18px!important;padding:0 10px!important}
  body:not(.read-mode) .bar-value{font-size:18px!important}
  body:not(.read-mode) .bar-label{font-size:9px!important}
  body:not(.read-mode) .evidence-list{gap:0!important}
  body:not(.read-mode) .evidence{padding:8px 0!important;grid-template-columns:58px 1fr!important;gap:10px!important}
  body:not(.read-mode) .evidence strong{font-size:19px!important}
  body:not(.read-mode) .evidence p{font-size:11px!important;line-height:1.34!important}

  body:not(.read-mode) .flow{grid-template-columns:1fr 1fr!important;gap:6px!important;margin-top:10px!important}
  body:not(.read-mode) .flow-step{min-height:0!important;padding:9px 8px 6px!important}
  body:not(.read-mode) .flow-step small{font-size:7px!important}
  body:not(.read-mode) .flow-step strong{font-size:12px!important;margin-top:4px!important}
  body:not(.read-mode) .flow-step p{font-size:9px!important;line-height:1.25!important;margin-top:4px!important}
  body:not(.read-mode) .question{font-size:19px!important;line-height:1.2!important;padding:10px 0!important;margin-top:10px!important}

  body:not(.read-mode) .questions{margin-top:10px!important}
  body:not(.read-mode) .question-row{grid-template-columns:34px 1fr!important;gap:8px!important;padding:8px 0!important}
  body:not(.read-mode) .question-row p{font-size:13px!important;line-height:1.25!important}
  body:not(.read-mode) .goal-line{font-size:11px!important;margin-top:8px!important}

  body:not(.read-mode) .position-grid{gap:8px!important;margin-top:10px!important}
  body:not(.read-mode) .position-card{padding:10px!important}
  body:not(.read-mode) .position-card h3{font-size:17px!important;margin:5px 0 6px!important}
  body:not(.read-mode) .position-card p{font-size:10.5px!important;line-height:1.3!important}
  body:not(.read-mode) .position-arrow{font-size:16px!important;min-height:12px!important}
  body:not(.read-mode) .contribution{margin-top:8px!important;padding:8px 10px!important;font-size:10.5px!important}

  body:not(.read-mode) .method-grid{gap:7px!important;margin-top:10px!important}
  body:not(.read-mode) .method{min-height:0!important;padding:10px!important}
  body:not(.read-mode) .method h3{font-size:17px!important;margin:4px 0 4px!important}
  body:not(.read-mode) .method p{font-size:10px!important;line-height:1.25!important}
  body:not(.read-mode) .limit-note{margin-top:7px!important;padding-top:7px!important;font-size:10px!important}

  body:not(.read-mode) .sartre-grid{grid-template-columns:92px 1fr!important;gap:12px!important;align-items:start!important}
  body:not(.read-mode) .portrait{height:125px!important}
  body:not(.read-mode) .portrait:after{font-size:8px!important;bottom:7px!important;left:7px!important}
  body:not(.read-mode) .sartre-facts{display:grid!important;gap:3px!important;margin-top:8px!important;padding-top:7px!important;font-size:9.5px!important}

  body:not(.read-mode) .concept-map{gap:5px!important;margin-top:10px!important}
  body:not(.read-mode) .concept-box{min-height:0!important;padding:9px!important}
  body:not(.read-mode) .concept-box h3{font-size:16px!important;margin:4px 0!important}
  body:not(.read-mode) .concept-box p{font-size:9.5px!important;line-height:1.25!important}
  body:not(.read-mode) .connector{font-size:14px!important;min-height:10px!important}
  body:not(.read-mode) .badfaith-band{gap:6px!important;margin-top:6px!important;padding:9px!important}
  body:not(.read-mode) .badfaith-band span{font-size:9px!important}
  body:not(.read-mode) .badfaith-band strong{font-size:17px!important}

  body:not(.read-mode) .definition{font-size:19px!important;line-height:1.22!important;margin:8px 0 10px!important}
  body:not(.read-mode) .criteria{grid-template-columns:repeat(5,1fr)!important}
  body:not(.read-mode) .criterion{min-height:46px!important;padding:6px 4px!important}
  body:not(.read-mode) .criterion small{font-size:7px!important;margin-bottom:3px!important}
  body:not(.read-mode) .criterion strong{font-size:9px!important;line-height:1.1!important}
  body:not(.read-mode) .spectrum{gap:4px!important;margin-top:8px!important}
  body:not(.read-mode) .spectrum span{padding:4px 6px!important;font-size:9px!important}

  body:not(.read-mode) .rational-grid{grid-template-columns:1fr 1fr!important;gap:6px!important;margin-top:10px!important}
  body:not(.read-mode) .rational{min-height:0!important;padding:8px!important}
  body:not(.read-mode) .rational small{font-size:7px!important}
  body:not(.read-mode) .rational strong{font-size:14px!important;line-height:1.15!important;margin-top:4px!important}
  body:not(.read-mode) .legend{gap:8px!important;margin-top:7px!important;font-size:8.5px!important;flex-wrap:wrap!important}

  body:not(.read-mode) .findings{gap:7px!important;margin-top:10px!important}
  body:not(.read-mode) .finding{padding:11px!important}
  body:not(.read-mode) .finding h3{font-size:17px!important;margin:4px 0 5px!important}
  body:not(.read-mode) .finding p{font-size:10px!important;line-height:1.25!important;margin-bottom:5px!important}
  body:not(.read-mode) .finding .plain{font-size:14px!important}
  body:not(.read-mode) .keyline{margin-top:7px!important;padding-top:7px!important;font-size:10px!important}

  body:not(.read-mode) .synthesis{grid-template-columns:1fr 1fr!important;margin-top:10px!important}
  body:not(.read-mode) .synth{min-height:0!important;padding:8px!important}
  body:not(.read-mode) .synth small{font-size:6.5px!important}
  body:not(.read-mode) .synth strong{font-size:11px!important;margin-top:3px!important}
  body:not(.read-mode) .synth p{font-size:8px!important;margin-top:3px!important}
  body:not(.read-mode) .branch{grid-template-columns:1fr 1fr!important;gap:5px!important;margin-top:6px!important}
  body:not(.read-mode) .branch div{padding:7px!important;font-size:9px!important}

  body:not(.read-mode) .answers{gap:7px!important;margin-top:10px!important}
  body:not(.read-mode) .answer{min-height:0!important;padding:10px!important}
  body:not(.read-mode) .answer h3{font-size:16px!important;margin:4px 0 5px!important}
  body:not(.read-mode) .answer p{font-size:10px!important;line-height:1.25!important}

  body:not(.read-mode) .closing-grid{gap:12px!important}
  body:not(.read-mode) .thanks{font-size:34px!important;margin-bottom:10px!important}
  body:not(.read-mode) .closing-point{grid-template-columns:30px 1fr!important;gap:8px!important;padding:9px 0!important}
  body:not(.read-mode) .closing-point span{font-size:16px!important}
  body:not(.read-mode) .closing-point p{font-size:12px!important;line-height:1.25!important}

  body:not(.read-mode) .chrome{bottom:calc(8px + env(safe-area-inset-bottom))!important}
  body:not(.read-mode) .icon-btn,body:not(.read-mode) .nav-btn,body:not(.read-mode) .scene-status{height:38px!important}
  body:not(.read-mode) .icon-btn{width:38px!important}
  body:not(.read-mode) .nav-btn{min-width:38px!important;padding:0 10px!important}
  body:not(.read-mode) .scene-status{font-size:10px!important;padding:0 10px!important}
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
  'MOBILE PRESENTATION COMPACT LAYOUT',
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
