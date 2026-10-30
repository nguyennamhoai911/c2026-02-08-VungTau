import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parseTideCSV } from '../public/model.js';
const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const read = year => fs.readFileSync(new URL(`../public/${year === 2026 ? 'data' : 'data-2027'}.csv`, import.meta.url), 'utf8');
const c = vm.createContext({});
for (const name of ['parseTime', 'parseNumber', 'parseTideCSV', 'getDay']) {
 const start = html.indexOf(`    function ${name}(`);
 vm.runInContext(html.slice(start, html.indexOf('\n    }', start) + 6), c);
}
const old = parseTideCSV(read(2026)), added = parseTideCSV(read(2027), 2027);
test('2027 contains all 365 consecutive local dates and 8760 finite hourly values', () => {
 assert.equal(added.length, 365);
 assert.equal(new Set(added.map(d => d.date)).size, 365);
 for (let i = 0; i < added.length; i++) {
  const d = added[i];
  assert.equal(d.date, new Date(Date.UTC(2027, 0, i + 1)).toISOString().slice(0,10));
  assert.equal(d.hours.length, 24);
  assert.ok(d.hours.every(Number.isFinite));
  assert.ok(d.highTides.length > 0 && d.lowTides.length > 0);
  for (const e of [...d.highTides, ...d.lowTides]) {
   assert.match(e.time, /^([01]\d|2[0-3]):[0-5]\d$/);
   assert.ok(Number.isFinite(e.height));
  }
 }
 assert.deepEqual(Array.from({length:12}, (_, m) => added.filter(d=>d.month===m+1).length), [31,28,31,30,31,30,31,31,30,31,30,31]);
});
test('inline and module parsers agree for both years; lookup crosses year without fallback dates', () => {
 for (const year of [2026,2027]) assert.equal(JSON.stringify(c.parseTideCSV(read(year), year)), JSON.stringify(parseTideCSV(read(year), year)));
 assert.equal(old.length,365);
 c.state = { data: [...old, ...added], selectedDate:'2027-01-01' };
 assert.equal(c.getDay('2026-12-31').date,'2026-12-31');
 assert.equal(c.getDay().date,'2027-01-01');
 assert.equal(c.getDay('2028-01-01'),null);
});
test('source engine reproduces published Vung Tau reference tides in local time', () => {
 const metadata=JSON.parse(fs.readFileSync(new URL('../../docs/tide-is-vung-tau-metadata.json',import.meta.url)));
 const packed=JSON.parse(fs.readFileSync(new URL('../../docs/tide-is-vn-harmonics.json',import.meta.url)))[metadata.station.id];
 const ctx=vm.createContext({});
 vm.runInContext(fs.readFileSync(new URL('../../docs/tide-is-harmonic-source.js',import.meta.url),'utf8'),ctx);
 const cons={};
 for(let i=0;i<packed.length;i+=3)cons[metadata.meta.cons[packed[i]]]=[packed[i+1]/10,packed[i+2]/10];
 const engine=ctx.TideHarmonic, harmonic=engine.prepare(cons);
 const start=Date.parse('2026-10-29T00:00:00+07:00');
 const events=engine.events(harmonic,start,start+86400000,.02);
 const expected=[['H','02:02',4.1],['L','09:17',.6],['H','16:35',4.2],['L','21:41',3.0]];
 assert.equal(events.length,expected.length);
 events.forEach((e,i)=>{
  assert.equal(e.type,expected[i][0]);
  assert.equal(new Date(e.t+7*3600000).toISOString().slice(11,16),expected[i][1]);
  assert.equal(Number((e.h+metadata.station.z0).toFixed(1)),expected[i][2]);
 });
 const validation=JSON.parse(fs.readFileSync(new URL('../../docs/du-bao-2027-da-kiem-chung-metadata.json',import.meta.url)));
 const verified=fs.readFileSync(new URL('../../docs/du-bao-2027-theo-mo-hinh-da-kiem-chung.csv',import.meta.url),'utf8').trim().split(/\r?\n/).slice(1).map(line=>line.split(','));
 assert.equal(verified.length,8760);
 added.forEach((day,i)=>day.hours.forEach((height,hour)=>{
  const row=verified[i*24+hour];
  assert.equal(row[0],`${day.date}T${String(hour).padStart(2,'0')}:00:00`);
  assert.equal(height,Number(Number(row[1]).toFixed(2)));
 }));
 for(const day of added){
  const ms=Date.parse(`${day.date}T00:00:00+07:00`);
  const shifted=engine.events(harmonic,ms,ms+86400000,.02);
  for(const [type,actual] of [['H',day.highTides],['L',day.lowTides]]){
   const expected=shifted.filter(e=>e.type===type);
   assert.equal(actual.length,expected.length);
   actual.forEach((event,i)=>{
    assert.equal(event.time,new Date(expected[i].t+7*3600000).toISOString().slice(11,16));
    assert.equal(event.height,Number((expected[i].h+metadata.station.z0+validation.offset_m).toFixed(2)));
   });
  }
 }
});
