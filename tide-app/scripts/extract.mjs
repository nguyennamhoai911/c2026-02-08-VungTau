import fs from 'node:fs';
const old = fs.readFileSync('../archive/tide-app/legacy-index.html', 'utf8');
const parser = old.slice(old.indexOf('    function parseTime('), old.indexOf('    function todayIso('));
const scores = old.slice(old.indexOf('    function scoreHeight('), old.indexOf('    function buildFootballReason('));
fs.writeFileSync('public/model.js', `${parser}\n${scores}\nexport { parseTideCSV, scoreRisingFootball, scoreFallingFootball };\n`);
