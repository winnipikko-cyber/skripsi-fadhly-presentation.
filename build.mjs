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

const html = chunks.join('');

const required = [
  '<!DOCTYPE html>',
  '121104011',
  '69,21%',
  '72,78%',
  'Sidang Skripsi — Fadhly Aziez Jalaluddin',
  'Eksistensi mendahului esensi',
  'https://bad-faith-sidang.vercel.app'
];

for (const marker of required) {
  if (!html.includes(marker)) throw new Error(`Missing required marker: ${marker}`);
}

const forbidden = [
  'DecompressionStream',
  '@/' + 'mnt/data',
  '_vercel_share='
];

for (const marker of forbidden) {
  if (html.includes(marker)) throw new Error(`Forbidden runtime marker found: ${marker}`);
}

await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await writeFile(new URL('./dist/index.html', import.meta.url), html, 'utf8');
console.log(`Built direct static presentation: ${html.length} characters`);
