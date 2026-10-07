import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { callProvider, getProviderSettings, setProviderSettings } from '../src/lib/providers.ts';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; setProviderSettings(null); });
const messages = [
  { role: 'system', content: 'Interview instructions' },
  { role: 'assistant', content: 'Opening question' },
  { role: 'user', content: 'Candidate answer' },
];

test('Gemini sends system instructions, mapped history, key header, and token budget', async () => {
  setProviderSettings({ provider: 'gemini', apiKey: ' test-key ', model: 'gemini-2.5-flash' });
  globalThis.fetch = async (url, request) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    assert.equal(request.headers['x-goog-api-key'], 'test-key');
    const body = JSON.parse(request.body);
    assert.equal(body.systemInstruction.parts[0].text, 'Interview instructions');
    assert.deepEqual(body.contents.map(m => m.role), ['model', 'user']);
    assert.equal(body.generationConfig.maxOutputTokens, 500);
    return Response.json({ candidates: [{ content: { parts: [{ text: 'Follow-up ' }, { text: 'question' }] } }] });
  };
  assert.equal(await callProvider(messages, 500), 'Follow-up question');
});

test('custom OpenAI-compatible endpoints receive chat requests and evaluation budget', async () => {
  setProviderSettings({ provider: 'openai-compatible', apiKey: 'test-key', model: 'custom-model', baseUrl: 'https://example.com/api/v1/' });
  globalThis.fetch = async (url, request) => {
    assert.equal(url, 'https://example.com/api/v1/chat/completions');
    assert.equal(request.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(JSON.parse(request.body), { model: 'custom-model', messages, max_tokens: 1024 });
    return Response.json({ choices: [{ message: { content: '{"decision":"hire"}' } }] });
  };
  assert.equal(await callProvider(messages, 1024), '{"decision":"hire"}');
});

test('missing credentials and unsafe endpoint URLs are rejected before sending', async () => {
  globalThis.fetch = async () => { assert.fail('must not send'); };
  await assert.rejects(callProvider(messages, 500), /Choose a provider/);
  for (const baseUrl of ['http://example.com/v1', 'https://user:pass@example.com/v1', 'https://example.com/v1?key=secret']) {
    setProviderSettings({ provider: 'openai-compatible', apiKey: 'test-key', model: 'test', baseUrl });
    await assert.rejects(callProvider(messages, 500), /valid HTTPS/);
  }
  setProviderSettings(null);
  assert.equal(getProviderSettings(), null);
});

test('authentication, quota, and empty responses produce actionable errors', async () => {
  setProviderSettings({ provider: 'gemini', apiKey: 'test-key', model: 'test' });
  for (const [status, pattern] of [[401, /rejected the API key/], [429, /usage limit/], [404, /model and account/]]) {
    globalThis.fetch = async () => new Response('', { status });
    await assert.rejects(callProvider(messages, 500), pattern);
  }
  globalThis.fetch = async () => Response.json({ candidates: [] });
  await assert.rejects(callProvider(messages, 500), /returned no text/);
});
