export type Provider = 'gemini' | 'openai-compatible';
export interface ProviderSettings {
  provider: Provider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

// User credentials live only in this tab's memory, never in browser storage.
let settings: ProviderSettings | null = null;
export function getProviderSettings() { return settings; }
export function setProviderSettings(value: ProviderSettings | null) {
  settings = value ? { ...value, apiKey: value.apiKey.trim(), model: value.model.trim() } : null;
}

export async function callProvider(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  maxTokens: number,
): Promise<string> {
  const config = settings;
  if (!config?.apiKey || !config.model) throw new Error('Choose a provider, API key, and model on the home page.');
  const gemini = config.provider === 'gemini';
  let baseUrl = config.baseUrl?.trim().replace(/\/+$/, '') ?? '';
  if (!gemini) {
    try {
      const endpoint = new URL(baseUrl);
      if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) throw new Error();
      baseUrl = endpoint.href.replace(/\/+$/, '');
    } catch {
      throw new Error('Enter a valid HTTPS API base URL without credentials, query parameters, or fragments.');
    }
  }
  const url = gemini
    ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`
    : `${baseUrl}/chat/completions`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: gemini
        ? { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey }
        : { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}`, 'X-Title': 'AI Interview Practice' },
      body: JSON.stringify(gemini ? {
        systemInstruction: { parts: [{ text: messages.filter(m => m.role === 'system').map(m => m.content).join('\n') }] },
        contents: messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }],
        })),
        generationConfig: { maxOutputTokens: maxTokens },
      } : { model: config.model, messages, max_tokens: maxTokens }),
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw new Error('Could not reach your AI provider. Check your connection and try again.');
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Your provider rejected the API key. Check its access and permissions.');
    if (response.status === 429) throw new Error('Your provider usage limit was reached. Wait or choose another model or provider.');
    throw new Error(`Your provider could not complete the request (HTTP ${response.status}). Check the model and account availability.`);
  }
  const data = await response.json();
  const text = gemini
    ? data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('')
    : data.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Your provider returned no text. Try another response or model.');
  return text;
}
