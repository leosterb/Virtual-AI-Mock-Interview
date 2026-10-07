import { InterviewResult } from './types';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export function buildPrintableReport(result: InterviewResult): string {
  const answers = result.transcript.filter(message => message.role === 'candidate');
  const rating = (score: number) => {
    if (!Number.isInteger(score) || score < 1 || score > 10) throw new Error('The report contains an invalid score.');
    return `<span class="stars">${'★'.repeat(score)}${'☆'.repeat(10 - score)}</span> <strong>${score}/10</strong>`;
  };
  const list = (items: string[]) => `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Interview feedback</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { max-width: 760px; margin: 36px auto; padding: 0 20px; color: #17253a; background: white; font: 14px/1.6 system-ui, sans-serif; }
    h1 { font-size: 30px; margin-bottom: 4px; } h2 { font-size: 19px; margin-top: 30px; border-bottom: 1px solid #dce3e9; padding-bottom: 8px; }
    h3 { margin-bottom: 8px; } p, li { overflow-wrap: anywhere; white-space: pre-wrap; } .subtle { color: #566477; } .stars { color: #976b00; letter-spacing: 2px; }
    table { width: 100%; border-collapse: collapse; } td { padding: 10px 0; border-bottom: 1px solid #e6eaee; } article, tr { break-inside: avoid; }
    .tools { background: #edf8f5; padding: 16px; border-radius: 12px; } button { border: 0; border-radius: 8px; padding: 10px 16px; color: white; background: #0f766e; cursor: pointer; }
    @media print { body { margin: 0; padding: 0; max-width: none; } .tools { display: none; } h2, h3 { break-after: avoid; } }
  </style></head><body>
    <div class="tools"><button type="button">Print / Save as PDF</button><p>Choose Save as PDF in your browser's print dialog.</p></div>
    <h1>Interview feedback</h1><p class="subtle">AI Interview Practice · Practice feedback, not a hiring decision</p>
    <p>${escapeHtml(result.reasoning)}</p>
    <h2>Performance scores</h2><table>${Object.entries(result.scores).map(([key, score]) => `<tr><td>${escapeHtml(key.replace(/([A-Z])/g, ' $1').trim())}</td><td>${rating(score)}</td></tr>`).join('')}</table>
    <h2>Your answers</h2>${result.answerRatings.map(item => `<article><h3>Answer ${item.answerIndex}</h3><p>${rating(item.score)}</p><p class="subtle">${escapeHtml(answers[item.answerIndex - 1]?.content ?? '')}</p><p>${escapeHtml(item.feedback)}</p></article>`).join('')}
    <h2>Strengths</h2>${list(result.strengths)}<h2>Areas for improvement</h2>${list(result.improvements)}
    <h2>Interview transcript</h2>${result.transcript.map(message => `<article><h3>${message.role === 'candidate' ? 'You' : 'Alex'}</h3><p>${escapeHtml(message.content)}</p></article>`).join('')}
  </body></html>`;
}

export function printFeedback(result: InterviewResult): void {
  const popup = window.open('', '_blank', 'width=900,height=750');
  if (!popup) throw new Error('Allow pop-ups for this site, then try Save as PDF again.');
  popup.opener = null;
  popup.addEventListener('load', () => {
    popup.document.querySelector('button')?.addEventListener('click', () => popup.print());
    popup.focus();
    popup.print();
  }, { once: true });
  popup.document.write(buildPrintableReport(result));
  popup.document.close();
}
