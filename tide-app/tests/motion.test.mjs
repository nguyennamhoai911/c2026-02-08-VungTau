import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const start = html.indexOf('    const motionSurfaces =');
const end = html.indexOf('    function renderAll()', start);

test('motion follows navigation direction, cancels rapid transitions, and respects reduced motion', () => {
  let reduced = false, cancelled = 0;
  const frames = [];
  const element = { animate(keyframes) { frames.push(keyframes); return { cancel() { cancelled++; } }; } };
  const context = vm.createContext({ window: { matchMedia: () => ({ matches: reduced }) } });
  vm.runInContext(html.slice(start, end), context);
  context.animateSurface(element, '2026-10');
  assert.equal(frames.length, 0);
  context.animateSurface(element, '2026-11');
  assert.match(frames[0][0].transform, /\(28px\)/);
  context.animateSurface(element, '2026-10');
  assert.match(frames[1][0].transform, /\(-28px\)/);
  assert.equal(cancelled, 1);
  reduced = true;
  context.animateSurface(element, '2026-12');
  assert.equal(frames.length, 2);
  assert.equal(cancelled, 2);
});

test('inline app script parses', () => {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  new vm.Script(script.replace(/^\s*import .*?;\s*$/mg, ''));
});
