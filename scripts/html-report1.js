const fs = require('fs');
const path = require('path');

const RESULTS_JSON = path.resolve(process.cwd(), 'test-results', 'results.json');
const OUT_HTML = path.resolve(process.cwd(), 'test-results', 'custom-report.html');

if (!fs.existsSync(RESULTS_JSON)) {
  console.error('Results JSON not found:', RESULTS_JSON);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(RESULTS_JSON, 'utf8'));
const tests = (data.tests || []).map(t => {
  const title = (t.title || []).join(' › ');
  const atts = (t.attachments || []).map(a => a.path || a.name || '').filter(Boolean)
    .map(p => `<a href="${p}">${path.basename(p)}</a>`).join(' ');
  return `<tr><td>${title}</td><td>${t.status}</td><td>${t.duration || ''}</td><td>${atts}</td></tr>`;
}).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Custom Report</title>
<style>body{font-family:Arial}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px}</style>
</head><body>
<h1>Custom Playwright Report</h1>
<table><thead><tr><th>Test</th><th>Status</th><th>Duration</th><th>Attachments</th></tr></thead><tbody>${tests}</tbody></table>
</body></html>`;
fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
fs.writeFileSync(OUT_HTML, html, 'utf8');
console.log('Custom report generated:', OUT_HTML);