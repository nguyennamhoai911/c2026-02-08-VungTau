import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parseTideCSV, scoreRisingFootball, scoreFallingFootball } from '../public/model.js';

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const context = vm.createContext({});
for (const name of ['heightAtMinute', 'scoreSauFootball', 'calendarForecast']) {
  const start = html.indexOf(`    function ${name}(`);
  const end = html.indexOf('\n    }', start) + 6;
  vm.runInContext(html.slice(start, end), context);
}
vm.runInContext('const FOOTBALL_SAMPLE_MINUTES = [990, 1020, 1050, 1080, 1110];', context);
const data = parseTideCSV(fs.readFileSync(new URL('../public/data.csv', import.meta.url), 'utf8'));

function forecast(day) {
  const [a, b, c] = [1020, 1050, 1080].map(minute => context.heightAtMinute(day, minute));
  const score = Math.round(c > a ? scoreRisingFootball(a, b, c) : scoreFallingFootball(a, b, c));
  return context.calendarForecast(score, 'football', day);
}

test('Bai Sau calibration matches the observed 5% on 29 October', () => {
  const day = data.find(day => day.date === '2026-10-29');
  const result = forecast(day);
  assert.equal(result.label, 'Bãi Sau');
  assert.equal(result.score, 5);
  assert.equal(result.status, 'bad');
  assert.equal(forecast({ ...day, date: '2026-10-30' }).score, 5);
});

test('Bai Sau scores stay bounded and decrease as high water increases', () => {
  for (const day of data) {
    const result = forecast(day);
    assert.ok(Number.isFinite(result.score) && result.score >= 0 && result.score <= 100);
  }
  const flat = height => ({ hours: Array(24).fill(height) });
  assert.equal(context.scoreSauFootball(flat(2.9), 0), 100);
  assert.ok(context.scoreSauFootball(flat(3.5), 0) > context.scoreSauFootball(flat(3.9), 0));
  assert.equal(context.scoreSauFootball(null, 0), null);
});
