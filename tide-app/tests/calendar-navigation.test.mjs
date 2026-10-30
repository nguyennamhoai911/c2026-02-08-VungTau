import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
function setup() {
  const state = { selectedMonth: '2026-10', selectedDate: '2026-10-30', notes: {} };
  const context = vm.createContext({ state, localStorage: { setItem() {} }, getDay: () => ({}), $: () => null, $$: () => [], renderAll() {}, renderMonth() {}, renderCustomDatePicker() {}, Date });
  for (const name of ['setSelectedDate', 'setTab', 'shiftCalendarMonth', 'bindCalendarSwipe']) {
    const start = html.indexOf(`    function ${name}(`);
    vm.runInContext(html.slice(start, html.indexOf('\n    }', start) + 6), context);
  }
  return context;
}
test('browsed month and selected adjacent date survive detail and return', () => {
  const c = setup();
  c.shiftCalendarMonth('selectedMonth', 1);
  c.setSelectedDate('2026-12-01', true);
  c.setTab('detail');
  c.setTab('month');
  assert.equal(c.state.selectedMonth, '2026-11');
  assert.equal(c.state.selectedDate, '2026-12-01');
  c.shiftCalendarMonth('selectedMonth', 1);
  c.shiftCalendarMonth('selectedMonth', 1);
  assert.equal(c.state.selectedMonth, '2027-01');
});
test('horizontal swipes navigate once, suppress clicks, and ignore taps or vertical scrolling', () => {
  const c = setup(), handlers = {}, steps = [];
  c.bindCalendarSwipe({ addEventListener: (name, fn) => { handlers[name] = fn; } }, step => steps.push(step));
  const gesture = (x, y) => {
    handlers.pointerdown({ isPrimary: true, button: 0, pointerId: 1, clientX: 100, clientY: 100 });
    handlers.pointerup({ pointerId: 1, clientX: x, clientY: y });
  };
  gesture(20, 105);
  let prevented = false, stopped = false;
  handlers.click({ preventDefault() { prevented = true; }, stopImmediatePropagation() { stopped = true; } });
  assert.ok(prevented && stopped);
  gesture(180, 100);
  gesture(105, 100);
  gesture(120, 220);
  assert.deepEqual(steps, [1, -1]);
});
