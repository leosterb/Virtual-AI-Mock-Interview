import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { loadSource } from './load-source.mjs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.com' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
after(() => dom.window.close());

async function hook(t, useHook) {
  let current;
  function Probe() { const value = useHook(); React.useLayoutEffect(() => { current = value; }); return null; }
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  let mounted = true;
  const unmount = async () => { if (mounted) { mounted = false; await act(async () => root.unmount()); container.remove(); } };
  t.after(unmount);
  await act(async () => root.render(React.createElement(Probe)));
  return { get current() { return current; }, unmount };
}

function mockSpeech() {
  let utterance;
  window.speechSynthesis = {
    getVoices: () => [], addEventListener() {}, removeEventListener() {}, cancel() {},
    speak(value) { utterance = value; },
  };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  return { get utterance() { return utterance; } };
}

test('speech resolves on completion and cancellation even if browser sends no cancel event', async t => {
  const speech = mockSpeech();
  const { useSpeechSynthesis } = loadSource('src/hooks/useSpeechSynthesis.ts');
  const h = await hook(t, useSpeechSynthesis);
  let pending;
  await act(async () => { pending = h.current.speak('Opening'); });
  assert.equal(h.current.isSpeaking, true);
  await act(async () => { speech.utterance.onend(); });
  assert.equal(await pending, true);
  assert.equal(h.current.isSpeaking, false);
  await act(async () => { pending = h.current.speak('Follow-up'); });
  await act(async () => h.current.stop());
  assert.equal(await pending, false);
});

test('unmount settles pending speech so an interview cannot remain stuck awaiting audio', async t => {
  mockSpeech();
  const { useSpeechSynthesis } = loadSource('src/hooks/useSpeechSynthesis.ts');
  const h = await hook(t, useSpeechSynthesis);
  let pending;
  await act(async () => { pending = h.current.speak('Question'); });
  await h.unmount();
  assert.equal(await pending, false);
});

function mockRecognition() {
  const instances = [];
  window.SpeechRecognition = class {
    constructor() { instances.push(this); this.starts = 0; }
    start() { this.starts++; }
    stop() { this.onend?.(); }
    abort() {}
  };
  return { get instance() { return instances.at(-1); } };
}

test('recognition updates interim words without duplicating the final transcript', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const recognition = mockRecognition();
  const { useSpeechRecognition } = loadSource('src/hooks/useSpeechRecognition.ts');
  const h = await hook(t, useSpeechRecognition);
  await act(async () => h.current.startListening());
  await act(async () => t.mock.timers.tick(100));
  await act(async () => recognition.instance.onresult({ resultIndex: 0, results: [{ 0: { transcript: 'I worked' }, isFinal: false }] }));
  assert.equal(h.current.transcript, 'I worked');
  await act(async () => recognition.instance.onresult({ resultIndex: 0, results: [{ 0: { transcript: 'I worked on software' }, isFinal: true }] }));
  assert.equal(h.current.transcript, 'I worked on software');
});

test('stopping or leaving cancels a pending microphone start', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const recognition = mockRecognition();
  const { useSpeechRecognition } = loadSource('src/hooks/useSpeechRecognition.ts');
  const h = await hook(t, useSpeechRecognition);
  await act(async () => { h.current.startListening(); h.current.stopListening(); });
  await act(async () => t.mock.timers.tick(100));
  assert.equal(recognition.instance.starts, 0);
  await act(async () => h.current.startListening());
  await h.unmount();
  await act(async () => t.mock.timers.tick(100));
  assert.equal(recognition.instance.starts, 0);
});
