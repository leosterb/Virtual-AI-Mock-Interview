'use client';

import { useState } from 'react';
import { getProviderSettings, setProviderSettings, Provider } from '@/lib/providers';

export function ProviderSetup({ onReady }: { onReady: () => void }) {
  const existing = getProviderSettings();
  const [provider, setProvider] = useState<Provider>(existing?.provider ?? 'gemini');
  const [apiKey, setApiKey] = useState(existing?.apiKey ?? '');
  const [model, setModel] = useState(existing?.model ?? 'gemini-3.1-flash-lite');
  const [baseUrl, setBaseUrl] = useState(existing?.baseUrl ?? 'https://openrouter.ai/api/v1');
  const [error, setError] = useState('');
  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900';

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-12 text-slate-900">
      <form className="mx-auto max-w-lg space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={event => {
        event.preventDefault();
        if (!apiKey.trim() || !model.trim()) return;
        if (provider !== 'gemini') {
          try {
            const url = new URL(baseUrl.trim());
            if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error();
          } catch { setError('Enter a valid HTTPS API base URL without credentials, query parameters, or fragments.'); return; }
        }
        setError('');
        setProviderSettings({ provider, apiKey, model, baseUrl });
        onReady();
      }}>
        <h1 className="text-3xl font-bold">Choose your AI provider</h1>
        <p className="text-slate-500">Bring your own API key for interview questions and feedback.</p>
        <label className="block space-y-2"><span>Provider</span>
          <select className={inputClass} value={provider} onChange={event => {
            const next = event.target.value as Provider;
            setProvider(next); setApiKey(''); setError('');
            setModel(next === 'gemini' ? 'gemini-3.1-flash-lite' : 'openrouter/free');
          }}>
            <option value="gemini">Google Gemini (Google AI Studio)</option>
            <option value="openai-compatible">OpenAI-compatible provider</option>
          </select>
        </label>
        <p className="text-sm text-slate-500">
          {provider === 'gemini' ? <><a className="underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Get a key from Google AI Studio</a>. Free-tier availability and usage limits vary by model and account.</> : <><a className="underline" href="https://openrouter.ai/settings/keys" target="_blank" rel="noopener noreferrer">Get an OpenRouter key</a> or use your preferred OpenAI-compatible provider. Model pricing and usage limits vary.</>}
        </p>
        {provider !== 'gemini' && <label className="block space-y-2"><span>API base URL</span>
          <input className={inputClass} type="url" required value={baseUrl} onChange={event => setBaseUrl(event.target.value)} placeholder="https://api.openai.com/v1" />
          <span className="text-sm text-slate-500">Include the API version path (such as /v1). The endpoint must support browser requests (CORS). Only use a provider you trust with your key and interview text.</span>
        </label>}
        <label className="block space-y-2"><span>API key</span>
          <input className={inputClass} type="password" autoComplete="off" required value={apiKey} onChange={event => setApiKey(event.target.value)} />
        </label>
        <label className="block space-y-2"><span>Model ID</span>
          <input className={inputClass} required value={model} onChange={event => setModel(event.target.value)} />
        </label>
        <p className="text-sm text-slate-500">Your key stays in this tab&apos;s memory and is sent directly to your selected provider. Refreshing clears it. Interview text is sent to that provider.</p>
        {error && <p role="alert" className="text-rose-700">{error}</p>}
        <button className="w-full rounded-lg bg-teal-700 text-white p-3 font-semibold hover:bg-teal-800" type="submit">Continue to role selection</button>
      </form>
    </main>
  );
}
