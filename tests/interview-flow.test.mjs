import { test, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { loadSource } from './load-source.mjs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.com' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
after(() => dom.window.close());
const originalSessionStorage = globalThis.sessionStorage;
afterEach(() => { globalThis.sessionStorage = originalSessionStorage; });
const role = { title: 'Software Engineer' };
const feedback = { decision: 'maybe', transcript: [], answerRatings: [] };

async function harness(t, options = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let transcript = '';
  let current;
  const calls = { speak: [], start: 0, end: [], process: [] };
  const saved = new Map();
  globalThis.sessionStorage = { setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) };
  const resetTranscript = () => { transcript = ''; };
  const startListening = () => { calls.start++; };
  const stopListening = () => {};
  const speak = async text => { calls.speak.push(text); return true; };
  const stop = () => {};
  const { useInterview } = loadSource('src/hooks/useInterview.ts', {
    './useSpeechRecognition': { useSpeechRecognition: () => ({ transcript, isListening: true, error: null, startListening, stopListening, resetTranscript }) },
    './useSpeechSynthesis': { useSpeechSynthesis: () => ({ speak, isSpeaking: false, stop }) },
    '@/lib/claude': {
      startInterview: async () => 'Opening question',
      processResponse: async (answer, signal) => { calls.process.push(answer); return options.process ? options.process(answer, signal) : 'Next question'; },
      endInterview: async answer => { calls.end.push(answer); if (options.failEvaluation) throw new Error('invalid feedback'); return options.evaluate ? options.evaluate() : { ...feedback }; },
    },
  });
  function Probe() { const interview = useInterview(); React.useLayoutEffect(() => { current = interview; }); return null; }
  const container = document.createElement('div');
  document.body.append(container);
  const renderer = createRoot(container);
  let mounted = true;
  async function unmount() {
    if (!mounted) return;
    mounted = false;
    await act(async () => renderer.unmount());
    container.remove();
  }
  await act(async () => renderer.render(React.createElement(Probe)));
  t.after(unmount);
  return {
    get current() { return current; }, calls, saved,
    async answer(value) { transcript = value; await act(async () => renderer.render(React.createElement(Probe))); },
    async start() {
      let pending;
      await act(async () => { pending = current.startInterviewSession(role); });
      return { pending };
    },
    async tick(ms) { await act(async () => t.mock.timers.tick(ms)); },
    unmount,
  };
}

test('opening speech waits three seconds, then starts listening', async t => {
  const h = await harness(t);
  const { pending } = await h.start();
  assert.equal(h.current.phase, 'waiting');
  await h.tick(2999);
  assert.equal(h.calls.speak.length, 0);
  await h.tick(1);
  await pending;
  assert.deepEqual(h.calls.speak, ['Opening question']);
  assert.equal(h.calls.start, 1);
  assert.equal(h.current.phase, 'active');
});

test('leaving during the preparation pause cancels opening speech', async t => {
  const h = await harness(t);
  const { pending } = await h.start();
  await h.unmount();
  await h.tick(3000);
  await pending;
  assert.equal(h.calls.speak.length, 0);
  assert.equal(h.calls.start, 0);
});

test('silence timer resets for updated speech rather than submitting mid-answer', async t => {
  const h = await harness(t);
  const { pending } = await h.start();
  await h.tick(3000); await pending;
  await h.answer('I worked');
  await h.tick(2500);
  await h.answer('I worked on a project');
  await h.tick(2500);
  assert.equal(h.calls.process.length, 0);
  await h.tick(500);
  assert.deepEqual(h.calls.process, ['I worked on a project']);
});

test('evaluation failure stays in the interview; success includes final transcript', async t => {
  const options = { failEvaluation: true };
  const h = await harness(t, options);
  const { pending } = await h.start();
  await h.tick(3000); await pending;
  await h.answer('My final answer');
  let success;
  await act(async () => { success = await h.current.endInterviewSession(); });
  assert.equal(success, false);
  assert.equal(h.current.phase, 'ending');
  assert.equal(h.saved.size, 0);
  assert.match(h.current.error, /invalid feedback/);
  options.failEvaluation = false;
  await act(async () => { success = await h.current.endInterviewSession(); });
  assert.equal(success, true);
  assert.equal(h.current.phase, 'ended');
  const result = JSON.parse(h.saved.get('interviewResult'));
  assert.equal(result.transcript.at(-1).content, 'My final answer');
  assert.deepEqual(h.calls.end, ['My final answer', 'My final answer']);
});

test('a failed provider call retains the answer for manual retry', async t => {
  let failed = true;
  const h = await harness(t, { process: async () => { if (failed) throw new Error('quota'); return 'Next question'; } });
  const { pending } = await h.start();
  await h.tick(3000); await pending;
  await h.answer('My answer');
  await act(async () => { await h.current.submitResponse(); });
  assert.equal(h.current.currentTranscript, 'My answer');
  assert.match(h.current.error, /quota/);
  assert.equal(h.current.messages.length, 1);
  failed = false;
  await act(async () => { await h.current.submitResponse(); });
  assert.deepEqual(h.current.messages.map(m => m.content), ['Opening question', 'My answer', 'Next question']);
});


test('ending without candidate answers skips AI feedback and placeholder ratings', async t => {
  const h = await harness(t);
  const { pending } = await h.start();
  await h.tick(3000); await pending;
  let success;
  await act(async () => { success = await h.current.endInterviewSession(); });
  assert.equal(success, true);
  assert.equal(h.current.phase, 'ended');
  assert.equal(h.current.result, null);
  assert.equal(h.calls.end.length, 0);
  assert.equal(h.saved.size, 0);
});


test('repeated End interview clicks send only one feedback request', async t => {
  let resolveEvaluation;
  const h = await harness(t, { evaluate: () => new Promise(resolve => { resolveEvaluation = resolve; }) });
  const { pending } = await h.start();
  await h.tick(3000); await pending;
  await h.answer('My answer');
  let first;
  let second;
  await act(async () => {
    first = h.current.endInterviewSession();
    second = h.current.endInterviewSession();
    resolveEvaluation({ ...feedback });
  });
  assert.equal(await first, true);
  assert.equal(await second, false);
  assert.equal(h.calls.end.length, 1);
});
