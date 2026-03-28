const fs = require('fs');
const file = 'c:\\code\\c2026-02-08-VungTau\\Dữ liệu thủy triều.md';
let content = fs.readFileSync(file, 'utf8');

const newMonth3 = fs.readFileSync('c:\\code\\c2026-02-08-VungTau\\new_month3.txt', 'utf8').split(/\r?\n/).filter(line => line.trim() !== '');
const newCount = newMonth3.length;

let lines = content.split(/\r?\n/);

let startIdx = -1;
for(let i=0; i<lines.length; i++) {
  if(lines[i].startsWith('1,3.8,3.4,2.9')) {
    startIdx = i;
    break;
  }
}

if (startIdx !== -1) {
    // Assuming March has exactly 31 days. We remove the next 31 lines and insert the updated ones.
    lines.splice(startIdx, 31, ...newMonth3);
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log("Successfully updated Month 3 data!");
} else {
    console.log("Could not find start index.");
}
