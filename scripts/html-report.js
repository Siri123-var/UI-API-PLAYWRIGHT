const fs = require('fs');
const path = require('path');

const RESULTS_JSON = path.resolve(process.cwd(), 'test-results', 'results.json');
const OUT_HTML = path.resolve(process.cwd(), 'test-results', 'custom-report.html');

function safeReadJSON(p) {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

function attachmentLink(a) {
  if (!a) return '';
  const p = a.path || a.body || a.name || '';
  if (!p) return '';
  const rel = path.relative(path.dirname(OUT_HTML), path.resolve(process.cwd(), p));
  return rel.split(path.sep).join('/');
}

function htmlEscape(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function buildReport(results) {
  const tests = (results && results.tests) || [];
  const totals = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0, timedOut: 0 };
  tests.forEach(t => {
    totals.total++;
    const status = t.status;
    if (status === 'passed') totals.passed++;
    else if (status === 'failed') totals.failed++;
    else if (status === 'skipped') totals.skipped++;
    else if (status === 'flaky') totals.flaky++;
    else if (status === 'timedOut') totals.timedOut++;
  });
  const pct = n => totals.total ? Math.round((n / totals.total) * 10000) / 100 : 0;

  const rows = tests.map(t => {
    // attachments (screenshots/videos) are in t.attachments
    const attachHtml = (t.attachments || []).map(a => {
      const rel = attachmentLink(a);
      const ext = path.extname(rel).toLowerCase();
      if (!rel) return '';
      if (['.png','.jpg','.jpeg','.webp','.gif'].includes(ext)) {
        return `<a href="${htmlEscape(rel)}" target="_blank"><img src="${htmlEscape(rel)}" style="max-width:160px;max-height:90px"/></a>`;
      }
      return `<a href="${htmlEscape(rel)}" target="_blank">${htmlEscape(path.basename(rel))}</a>`;
    }).join(' ');
    return {
      title: (t.title || []).join(' › '),
      status: t.status,
      duration: t.duration || '',
      location: (t.location && `${t.location.file}:${t.location.line}`) || '',
      attachments: attachHtml,
      project: t.project || ''
    };
  });

  // simple HTML
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Custom Playwright Report</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif; padding:20px}
  .stats{display:flex; gap:16px; margin-bottom:18px}
  .card{padding:12px; border-radius:6px; background:#f3f4f6}
  table{width:100%; border-collapse:collapse}
  th,td{border:1px solid #ddd; padding:8px; text-align:left}
  th{background:#111827; color:#fff}
  .passed{color:green} .failed{color:red} .skipped{color:orange}
  .thumb{max-width:120px; max-height:80px}
</style>
</head>
<body>
  <h1>Custom Playwright Report</h1>
  <div class="stats">
    <div class="card"><strong>Total:</strong> ${totals.total}</div>
    <div class="card"><strong class="passed">Passed:</strong> ${totals.passed} (${pct(totals.passed)}%)</div>
    <div class="card"><strong class="failed">Failed:</strong> ${totals.failed} (${pct(totals.failed)}%)</div>
    <div class="card"><strong>Skipped:</strong> ${totals.skipped} (${pct(totals.skipped)}%)</div>
    <div class="card"><strong>Flaky:</strong> ${totals.flaky}</div>
    <div class="card"><strong>TimedOut:</strong> ${totals.timedOut}</div>
  </div>

  <table>
    <thead>
      <tr><th>#</th><th>Test</th><th>Project</th><th>Status</th><th>Duration(ms)</th><th>Location</th><th>Attachments</th></tr>
    </thead>
    <tbody>
      ${rows.map((r,i)=>`<tr>
        <td>${i+1}</td>
        <td>${htmlEscape(r.title)}</td>
        <td>${htmlEscape(r.project)}</td>
        <td class="${r.status}">${htmlEscape(r.status)}</td>
        <td>${htmlEscape(r.duration)}</td>
        <td>${htmlEscape(r.location)}</td>
        <td>${r.attachments}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;
}

function main() {
  const results = safeReadJSON(RESULTS_JSON);
  if (!results) {
    console.error('Results JSON not found:', RESULTS_JSON);
    process.exitCode = 2;
    return;
  }
  const html = buildReport(results);
  fs.writeFileSync(OUT_HTML, html, 'utf8');
  console.log('Custom report generated:', OUT_HTML);
}

main();