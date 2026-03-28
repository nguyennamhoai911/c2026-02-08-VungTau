const fs = require('fs');
try {
  fs.copyFileSync('c:\\code\\c2026-02-08-VungTau\\Dữ liệu thủy triều.md', 'c:\\code\\c2026-02-08-VungTau\\Du_lieu_thuy_trieu.csv');
  console.log("Copied successfully");
} catch(e) {
  console.error("Failed to copy:", e);
}
