const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'Dữ liệu thủy triều.md');
const outputFile = path.join(__dirname, 'src', 'data', 'tide_data.json');

const data = fs.readFileSync(inputFile, 'utf-8');
const lines = data.split('\n').map(l => l.trim()).filter(l => l);

const result = [];
let currentMonth = 0;

function parseTime(t) {
  if (!t || t === '-' || t === '') return null;
  return t;
}

function parseVal(v) {
  if (!v || v === '-' || v === '') return null;
  return parseFloat(v);
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // header lines
  if (line.startsWith('Ngày,0h')) {
    currentMonth++;
    continue;
  }
  if (line.startsWith('Tháng,Ngày')) {
    continue;
  }

  const parts = line.split(',');
  if (parts.length < 32) continue; // sanity check minimum columns

  let isExplicitMonth = false;
  let month = currentMonth;
  let dayIdx = 0;

  // The format from month 7 onwards has 34 columns (Month + Day + 24 hours + 8 tide properties)
  if (parts.length >= 34) {
    month = parseInt(parts[0], 10);
    dayIdx = 1;
    currentMonth = month; // sync up just in case
  }

  const day = parseInt(parts[dayIdx], 10);
  
  const hours = [];
  let hIdx = dayIdx + 1;
  for (let h = 0; h < 24; h++) {
    hours.push(parseFloat(parts[hIdx++]));
  }

  const max1Time = parseTime(parts[hIdx++]);
  const max1Val = parseVal(parts[hIdx++]);
  const max2Time = parseTime(parts[hIdx++]);
  const max2Val = parseVal(parts[hIdx++]);
  const min1Time = parseTime(parts[hIdx++]);
  const min1Val = parseVal(parts[hIdx++]);
  const min2Time = parseTime(parts[hIdx++]);
  const min2Val = parseVal(parts[hIdx++]);

  // Construct a date string (YYYY-MM-DD); assuming year 2026 based on root directory
  const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  result.push({
    date: dateStr,
    month,
    day,
    hours,
    highTides: [
      { time: max1Time, height: max1Val },
      { time: max2Time, height: max2Val }
    ].filter(t => t.time !== null),
    lowTides: [
      { time: min1Time, height: min1Val },
      { time: min2Time, height: min2Val }
    ].filter(t => t.time !== null)
  });
}

const dir = path.dirname(outputFile);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');
console.log(`Successfully parsed ${result.length} days of tide data to ${outputFile}`);
