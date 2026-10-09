import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseTideCSV,scoreRisingFootball,scoreFallingFootball} from '../public/model.js';
const data=parseTideCSV(fs.readFileSync(new URL('../public/data.csv',import.meta.url),'utf8'));
test('365 unique valid days, 24 finite hourly measurements each',()=>{
 assert.equal(data.length,365);assert.equal(new Set(data.map(d=>d.date)).size,365);
 for(const d of data){assert.equal(new Date(d.date+'T00:00:00Z').toISOString().slice(0,10),d.date);assert.equal(d.hours.length,24);assert.ok(d.hours.every(Number.isFinite));}
 assert.equal(data[0].date,'2026-01-01');assert.equal(data.at(-1).date,'2026-12-31');
});
test('all daily football scores finite and bounded, rising/falling boundary cases',()=>{
 for(const d of data){const a=d.hours[17],b=d.hours[18],s=b>a?scoreRisingFootball(a,(a+b)/2,b):scoreFallingFootball(a,(a+b)/2,b);assert.ok(Number.isFinite(s)&&s>=0&&s<=100);}
 assert.equal(scoreRisingFootball(2,2.4,2.7),0);assert.equal(scoreRisingFootball(2,2.3,2.6),20);assert.equal(scoreFallingFootball(3.2,3.1,3),0);
});
test('missing measurements remain null instead of becoming zero',()=>{
 const parsed=parseTideCSV('Ngày,0h\n1,'+Array(24).fill('-').join(','));assert.ok(parsed[0].hours.every(v=>v===null));
});
test('deployment contains exactly the public allowlist and no personal history',()=>{
 const root=new URL('../dist/',import.meta.url);assert.deepEqual(fs.readdirSync(root).sort(),['app.js','data.csv','index.html','model.js','styles.css']);
 for(const file of ['app.js','model.js','index.html']){const content=fs.readFileSync(new URL(file,root),'utf8');assert.doesNotMatch(content,/FOOTBALL_OBSERVED_SCORES|vungTauTideNotes|localStorage|\/api\/|lich_su_thuc_te/);}
});
