const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

app.get('/api/tides', (req, res) => {
  // Reading from the parent folder (mounted in Docker)
  const inputFile = path.join(__dirname, '..', 'Dữ liệu thủy triều.md');
  if (!fs.existsSync(inputFile)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const data = fs.readFileSync(inputFile, 'utf-8');
  const lines = data.split('\n').map(l => l.trim()).filter(l => l);

  const result = [];
  let currentMonth = 0;

  const parseTime = (t) => (!t || t === '-' || t === '') ? null : t;
  const parseVal = (v) => {
    if (!v || v === '-' || v === '') return null;
    try { return parseFloat(v); } catch(e) { return null; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('Ngày,0h')) {
      currentMonth++;
      continue;
    }
    if (line.startsWith('Tháng,Ngày')) {
      continue;
    }

    const parts = line.split(',');
    if (parts.length < 32) continue;

    let month = currentMonth;
    let dayIdx = 0;

    if (parts.length >= 34) {
      const m = parseInt(parts[0], 10);
      if (!isNaN(m)) {
        month = m;
        dayIdx = 1;
        currentMonth = month;
      }
    }

    const day = parseInt(parts[dayIdx], 10);
    if (isNaN(day)) continue;

    const hours = [];
    let hIdx = dayIdx + 1;
    for (let h = 0; h < 24; h++) {
      const val = parseFloat(parts[hIdx++]);
      hours.push(isNaN(val) ? 0 : val);
    }

    const max1Time = hIdx < parts.length ? parseTime(parts[hIdx++]) : null;
    const max1Val = hIdx < parts.length ? parseVal(parts[hIdx++]) : null;
    const max2Time = hIdx < parts.length ? parseTime(parts[hIdx++]) : null;
    const max2Val = hIdx < parts.length ? parseVal(parts[hIdx++]) : null;
    const min1Time = hIdx < parts.length ? parseTime(parts[hIdx++]) : null;
    const min1Val = hIdx < parts.length ? parseVal(parts[hIdx++]) : null;
    const min2Time = hIdx < parts.length ? parseTime(parts[hIdx++]) : null;
    const min2Val = hIdx < parts.length ? parseVal(parts[hIdx++]) : null;

    const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const highTides = [];
    if (max1Time) highTides.push({ time: max1Time, height: max1Val });
    if (max2Time) highTides.push({ time: max2Time, height: max2Val });

    const lowTides = [];
    if (min1Time) lowTides.push({ time: min1Time, height: min1Val });
    if (min2Time) lowTides.push({ time: min2Time, height: min2Val });

    let dailyMax = -Infinity;
    highTides.forEach(t => dailyMax = Math.max(dailyMax, t.height));

    result.push({
      date: dateStr,
      month,
      day,
      hours,
      highTides,
      lowTides,
      dailyMax: dailyMax === -Infinity ? null : dailyMax
    });
  }

  res.json(result);
});

const PORT = 3132;
const os = require('os');

app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  let ip = '127.0.0.1';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ip = net.address;
        break;
      }
    }
  }
  
  console.log(`\n  ➜  Local:   http://localhost:${PORT}/`);
  console.log(`  ➜  Network: http://${ip}:${PORT}/\n`);
});
