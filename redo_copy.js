const fs = require('fs');
try {
  let content = fs.readFileSync('c:\\code\\c2026-02-08-VungTau\\Dữ liệu thủy triều.md', 'utf8');
  fs.writeFileSync('c:\\code\\c2026-02-08-VungTau\\tide-app\\public\\data.csv', content, 'utf8');
  console.log("Success");
} catch(e) {
  console.error("Error:", e);
  fs.writeFileSync('c:\\code\\c2026-02-08-VungTau\\tide-app\\public\\error_log.txt', e.toString(), 'utf8');
}
