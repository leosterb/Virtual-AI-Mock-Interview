import { test, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { loadSource } from './load-source.mjs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.com' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.sessionStorage = dom.window.sessionStorage;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
window.HTMLDialogElement.prototype.close = function () { this.open = false; };
const { createRoot } = await import('react-dom/client');
after(() => dom.window.close());
afterEach(() => sessionStorage.clear());

async function setup(t) {
  let settings = null;
  const routes = [];
  const { default: Home } = loadSource('src/app/page.tsx', {
    'next/navigation': { useRouter: () => ({ push: route => routes.push(route) }) },
    '@/lib/providers': { getProviderSettings: () => settings, setProviderSettings: value => { settings = value; } },
  });
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  t.after(async () => { await act(async () => root.unmount()); container.remove(); });
  await act(async () => root.render(React.createElement(Home)));
  const button = text => [...container.querySelectorAll('button')].find(element => element.textContent.includes(text));
  const click = async text => { const target = button(text); assert.ok(target, text); await act(async () => target.click()); };
  const configure = async () => {
    await click('Start practicing');
    const input = container.querySelector('input[type="password"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    await act(async () => { setter.call(input, 'test-key'); input.dispatchEvent(new window.Event('input', { bubbles: true })); });
    await act(async () => container.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })));
  };
  return { container, routes, click, configure, get settings() { return settings; } };
}

test('first visit shows a landing page and setup is entered only through Start practicing', async t => {
  const h = await setup(t);
  assert.match(h.container.textContent, /Your next chapter/);
  assert.equal(h.container.querySelector('input[type="password"]'), null);
  await h.click('Start practicing');
  assert.match(h.container.textContent, /Choose your AI provider/);
  await h.click('Back');
  assert.match(h.container.textContent, /Your next chapter/);
});

test('configured visitors can navigate home and settings without losing their key', async t => {
  const h = await setup(t);
  await h.configure();
  assert.match(h.container.textContent, /Select a Role/);
  assert.equal(h.settings.model, 'gemini-3.1-flash-lite');
  await h.click('Home');
  await h.click('Start practicing');
  assert.match(h.container.textContent, /Select a Role/);
  await h.click('AI settings');
  await h.click('Back');
  assert.equal(h.settings.apiKey, 'test-key');
  assert.match(h.container.textContent, /Select a Role/);
  await h.click('Disconnect');
  assert.equal(h.settings, null);
  assert.match(h.container.textContent, /Your next chapter/);
});

test('role preview confirmation stores the role and navigates to the interview', async t => {
  const h = await setup(t);
  await h.configure();
  await h.click('Software Engineer');
  assert.equal(h.routes.length, 0);
  await h.click('Proceed with interview');
  assert.deepEqual(h.routes, ['/interview']);
  assert.equal(JSON.parse(sessionStorage.getItem('interviewRole')).id, 'software-engineer');
});
