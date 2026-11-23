import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTideCSV, scoreRisingFootball, scoreFallingFootball } from '../../../../tide-app/public/model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');

const historyPath = path.join(rootDir, 'docs/lich_su_thuc_te_da_banh.json');
const csvPath = path.join(rootDir, 'tide-app/public/data.csv');
const htmlPath = path.join(rootDir, 'tide-app/public/index.html');

if (!fs.existsSync(historyPath) || !fs.existsSync(csvPath) || !fs.existsSync(htmlPath)) {
  console.error('Missing required project files for calibration verification.');
  process.exit(1);
}

const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
const data = parseTideCSV(fs.readFileSync(csvPath, 'utf8'));
const html = fs.readFileSync(htmlPath, 'utf8');

function heightAtMinute(day, minute) {
  const h = minute / 60;
  const h0 = Math.floor(h);
  const h1 = Math.min(23, h0 + 1);
  const f = h - h0;
  return day.hours[h0] * (1 - f) + day.hours[h1] * f;
}

const FOOTBALL_SAMPLE_MINUTES = [990, 1020, 1050, 1080, 1110];
function scoreSauFootball(day, duaScore) {
  if (!day || !Number.isFinite(duaScore)) return null;
  const samples = FOOTBALL_SAMPLE_MINUTES.map(minute => heightAtMinute(day, minute));
  if (samples.some(value => !Number.isFinite(value))) return null;
  const h1730 = samples[2];
  let rise = 0, fall = 0;
  for (let i = 1; i < samples.length; i += 1) {
    const delta = samples[i] - samples[i - 1];
    rise += Math.max(0, delta);
    fall += Math.max(0, -delta);
  }
  const heightPenalty = Math.max(0, h1730 - 2.3) * 62.5;
  const trend = Math.min(20, Math.max(0, fall - 0.1) * 20)
    - Math.min(20, Math.max(0, rise - 0.1) * 20);
  return Math.round(Math.max(0, Math.min(100, 100 - heightPenalty + trend)));
}

function calendarForecast(score, activity, day) {
  if (score === null) return { label: '', score: null, status: '' };
  const football = activity === 'football';
  const useDua = score >= 15;
  const displayedScore = football && !useDua ? scoreSauFootball(day, score) : score;
  return {
    label: football ? (useDua ? 'Bãi Dứa' : 'Bãi Sau') : '',
    score: displayedScore,
    status: displayedScore === null ? '' : displayedScore >= 70 ? 'good' : displayedScore >= 40 ? 'medium' : 'bad'
  };
}

console.log('--- KIỂM CHỨNG LỊCH SỬ QUAN TRẮC ĐÁ BANH (BÃI DỨA / BÃI SAU) ---');
let passCount = 0;

for (const entry of history) {
  const day = data.find(d => d.date === entry.date);
  if (!day) {
    console.warn(`[WARN] Không tìm thấy dữ liệu triều cho ngày ${entry.date}`);
    continue;
  }

  const [h17, h1730, h18] = [1020, 1050, 1080].map(min => heightAtMinute(day, min));
  const isRising = h18 > h17;
  const rawDua = Math.round(isRising ? scoreRisingFootball(h17, h1730, h18) : scoreFallingFootball(h17, h1730, h18));
  const forecast = calendarForecast(rawDua, 'football', day);

  const beachInfo = entry.beach ? ` (${entry.beach})` : '';
  console.log(`\nNgày ${entry.date}${beachInfo}:`);
  console.log(`  Mực nước: 17h = ${h17.toFixed(2)}m | 17h30 = ${h1730.toFixed(2)}m | 18h = ${h18.toFixed(2)}m | ${isRising ? 'Dâng' : 'Rút'}`);
  console.log(`  Bãi Dứa tính toán: ${rawDua}%`);
  console.log(`  Dự báo lịch: ${forecast.label} (${forecast.score}%)`);

  if (entry.beach === 'Bãi Dứa' && typeof entry.score === 'number') {
    if (forecast.label === 'Bãi Dứa' && forecast.score === entry.score) {
      console.log(`  -> [PASS] Khớp kỳ vọng Bãi Dứa ${entry.score}%`);
      passCount++;
    } else {
      console.error(`  -> [FAIL] Kỳ vọng Bãi Dứa ${entry.score}%, nhưng ra ${forecast.label} ${forecast.score}%`);
    }
  } else if (entry.beach === 'Bãi Sau' && typeof entry.score === 'number') {
    if (forecast.label === 'Bãi Sau' && forecast.score === entry.score) {
      console.log(`  -> [PASS] Khớp kỳ vọng Bãi Sau ${entry.score}%`);
      passCount++;
    } else {
      console.error(`  -> [FAIL] Kỳ vọng Bãi Sau ${entry.score}%, nhưng ra ${forecast.label} ${forecast.score}%`);
    }
  } else {
    passCount++;
  }
}

console.log(`\nHoàn thành kiểm tra: ${passCount}/${history.length} bản ghi hợp lệ.`);
