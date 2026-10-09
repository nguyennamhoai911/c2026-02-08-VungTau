import { mkdir, copyFile, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['index.html', 'styles.css', 'app.js', 'model.js', 'data.csv', 'brand-theme.css', 'logo-maritime.png', 'activity-football.png', 'activity-crab.png', 'header-coast.jpg'];
await rm(`${root}dist`, { recursive: true, force: true });
await mkdir(`${root}dist`, { recursive: true });
for (const file of files) await copyFile(`${root}public/${file}`, `${root}dist/${file}`);
if ((await readdir(`${root}dist`)).length !== files.length) throw new Error('Unexpected deployment files');
console.log(`Built ${files.length} allowlisted public files.`);
