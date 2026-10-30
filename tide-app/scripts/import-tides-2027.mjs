import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const docs = new URL('../../docs/', import.meta.url);
const read = name => fs.readFileSync(new URL(name, docs), 'utf8');
const metadata = JSON.parse(read('tide-is-vung-tau-metadata.json'));
const source = JSON.parse(read('tide-is-vn-harmonics.json'));
const validation = JSON.parse(read('du-bao-2027-da-kiem-chung-metadata.json'));
assert.equal(validation.model, 'TICON4_offset2025');
assert.equal(validation.parameters_fitted_through, '2025-12-31');
const levelOffset = validation.offset_m;
assert.ok(Number.isFinite(levelOffset));
const levelBase = metadata.station.z0 + levelOffset;
const context = vm.createContext({});
vm.runInContext(read('tide-is-harmonic-source.js'), context);
const engine = context.TideHarmonic;
const packed = source[metadata.station.id];
const constituents = {};
for (let i = 0; i < packed.length; i += 3) {
  constituents[metadata.meta.cons[packed[i]]] = [packed[i + 1] / 10, packed[i + 2] / 10];
}
const harmonic = engine.prepare(constituents);
const start = Date.parse('2027-01-01T00:00:00+07:00');
const end = Date.parse('2028-01-01T00:00:00+07:00');
const DAY = 86400000, HOUR = 3600000, OFFSET = 7 * HOUR;
const roundHeight = n => n.toFixed(2);
const localIso = ms => new Date(ms + OFFSET).toISOString();
const events = engine.events(harmonic, start - DAY, end + DAY, 0.02);
const header = fs.readFileSync(new URL('../public/data.csv', import.meta.url), 'utf8').split(/\r?\n/)[0];
const rows = [];
let min = Infinity, max = -Infinity;
for (let ms = start; ms < end; ms += DAY) {
  const iso = localIso(ms).slice(0, 10);
  if (iso.endsWith('-01')) rows.push(header);
  const heights = Array.from({ length: 24 }, (_, hour) => engine.level(harmonic, ms + hour * HOUR) + levelBase);
  assert.ok(heights.every(Number.isFinite));
  min = Math.min(min, ...heights); max = Math.max(max, ...heights);
  const daily = events.filter(e => e.t >= ms && e.t < ms + DAY);
  const highs = daily.filter(e => e.type === 'H');
  const lows = daily.filter(e => e.type === 'L');
  assert.ok(highs.length <= 2 && lows.length <= 2, iso + ': too many extremes');
  const pair = e => e ? [localIso(e.t).slice(11, 16), roundHeight(e.h + levelBase)] : ['-', '-'];
  rows.push([Number(iso.slice(8)), ...heights.map(roundHeight), ...pair(highs[0]), ...pair(highs[1]), ...pair(lows[0]), ...pair(lows[1])].join(','));
}
const target = new URL('../public/data-2027.csv', import.meta.url);
fs.writeFileSync(target, rows.join('\n') + '\n');
console.log(JSON.stringify({ file: fileURLToPath(target), days: 365, hourlyValues: 8760, min, max, datum: validation.datum, levelOffset, timezone: metadata.station.tz }));
