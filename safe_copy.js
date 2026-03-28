const fs = require('fs');
const files = fs.readdirSync('c:\\code\\c2026-02-08-VungTau');
const mdFile = files.find(f => f.endsWith('.md') && f.includes('li'));
if(mdFile) {
  const content = fs.readFileSync('c:\\code\\c2026-02-08-VungTau\\' + mdFile);
  fs.writeFileSync('c:\\code\\c2026-02-08-VungTau\\tide-app\\public\\data.csv', content);
  console.log("SUCCESS COPIED! Found: " + mdFile);
} else {
  console.log("NOT FOUND");
}
