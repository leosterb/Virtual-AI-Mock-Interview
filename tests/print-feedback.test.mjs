import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadSource } from './load-source.mjs';
const { buildPrintableReport, printFeedback } = loadSource('src/lib/printFeedback.ts');
const originalWindow = globalThis.window;
afterEach(() => { globalThis.window = originalWindow; });
const result = {
  reasoning: 'Clear examples', scores: { overall: 7 }, strengths: ['Clear communication'], improvements: ['Quantify results'],
  transcript: [{ role: 'interviewer', content: 'Tell me about yourself.' }, { role: 'candidate', content: 'I improved reliability.' }],
  answerRatings: [{ answerIndex: 1, score: 7, feedback: 'Explain the outcome.' }],
};

test('PDF report includes ratings, individual feedback, and the complete transcript', () => {
  const html = buildPrintableReport(result);
  for (const text of ['7/10', 'Explain the outcome.', 'Clear communication', 'Quantify results', 'Tell me about yourself.', 'I improved reliability.', '@media print']) assert.ok(html.includes(text));
  assert.match(html, /charset="utf-8"/);
});

test('untrusted answer and feedback text is escaped in the printable report', () => {
  const html = buildPrintableReport({ ...result, reasoning: '<script>alert(1)</script>', strengths: ['<img src=x onerror=alert(1)>'], transcript: [{ role: 'candidate', content: 'José & 李 <b>answer</b>' }] });
  assert.doesNotMatch(html, /<script>|<img/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /José &amp; 李 &lt;b&gt;/);
});

test('PDF action opens an isolated report and invokes the browser print dialog on load', () => {
  let load;
  let written;
  let printed = 0;
  const popup = {
    opener: {}, document: { write: html => { written = html; }, close() {}, querySelector: () => ({ addEventListener() {} }) },
    addEventListener: (_event, callback) => { load = callback; }, focus() {}, print: () => { printed++; },
  };
  globalThis.window = { open: () => popup };
  printFeedback(result);
  assert.equal(popup.opener, null);
  assert.ok(written.includes('Interview feedback'));
  assert.equal(printed, 0);
  load();
  assert.equal(printed, 1);
});

test('blocked report pop-ups produce actionable feedback', () => {
  globalThis.window = { open: () => null };
  assert.throws(() => printFeedback(result), /Allow pop-ups/);
});


test('unexpected score values cannot inject markup or allocate unbounded star strings', () => {
  for (const score of ['<script>alert(1)</script>', 999999999, -1, 1.5]) {
    assert.throws(() => buildPrintableReport({ ...result, scores: { overall: score } }), /invalid score/);
  }
});
