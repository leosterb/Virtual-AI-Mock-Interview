import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { loadSource } from './load-source.mjs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.com' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
window.HTMLDialogElement.prototype.close = function () { this.open = false; };
const { createRoot } = await import('react-dom/client');
const { RoleSelector } = loadSource('src/components/RoleSelector.tsx');
after(() => dom.window.close());

async function setup(t) {
  const calls = [];
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  t.after(async () => { await act(async () => root.unmount()); container.remove(); });
  await act(async () => root.render(React.createElement(RoleSelector, { onSelectRole: role => calls.push(role) })));
  const click = async element => { assert.ok(element); await act(async () => element.click()); };
  const button = text => [...container.querySelectorAll('button')].find(element => element.textContent.includes(text));
  return { container, calls, click, button };
}

test('a role card opens a detailed preview; only Proceed starts the interview', async t => {
  const h = await setup(t);
  await h.click(h.button('Software Engineer'));
  assert.equal(h.calls.length, 0);
  const dialog = h.container.querySelector('dialog');
  assert.equal(dialog.open, true);
  assert.match(dialog.textContent, /Programming/);
  assert.match(dialog.textContent, /3-second pause/);
  await h.click(h.button('Proceed with interview'));
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].id, 'software-engineer');
  assert.equal(h.container.querySelector('dialog'), null);
});

test('preview can be dismissed without entering the interview', async t => {
  const h = await setup(t);
  await h.click(h.button('Product Manager'));
  await h.click(h.container.querySelector('[aria-label="Close role details"]'));
  assert.equal(h.container.querySelector('dialog'), null);
  assert.equal(h.calls.length, 0);
  await h.click(h.button('Product Manager'));
  await act(async () => h.container.querySelector('dialog').dispatchEvent(new window.Event('cancel', { cancelable: true })));
  assert.equal(h.container.querySelector('dialog'), null);
});

test('experience filters and search narrow roles with a usable empty state', async t => {
  const h = await setup(t);
  await h.click(h.button('Senior level'));
  assert.equal(h.container.querySelectorAll('[aria-haspopup="dialog"]').length, 1);
  assert.match(h.container.textContent, /Product Manager/);
  await h.click(h.button('All levels'));
  const input = h.container.querySelector('input[type="search"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  await act(async () => { setter.call(input, 'does not exist'); input.dispatchEvent(new window.Event('input', { bubbles: true })); });
  assert.match(h.container.textContent, /No roles match/);
  await h.click(h.button('Reset filters'));
  assert.equal(h.container.querySelectorAll('[aria-haspopup="dialog"]').length, 7);
});
