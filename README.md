# AI Interview Practice

A browser-based mock interview app. Visitors choose a role and bring their own AI provider API key. No application server is required for the published website.

## Publish on GitHub Pages

1. Push these changes to `main` on `leosterb/Virtual-AI-Mock-Interview`.
2. In GitHub, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Open **Actions → Deploy website to GitHub Pages** and run the workflow (or let the next push to `main` trigger it).
4. After deployment succeeds, share **https://leosterb.github.io/Virtual-AI-Mock-Interview/**.

The workflow installs locked dependencies, tests the provider adapters, builds the static `out/` directory, and deploys it. `actions/configure-pages` supplies the base path, so links and assets work at the repository URL. No API keys belong in GitHub Actions secrets or the build: every visitor supplies their own key in the page. A public repository supports Pages on GitHub Free; private repository Pages availability depends on the account plan and settings.

GitHub Pages provides HTTPS for camera and microphone access. Visitors should use a supported browser (Chrome recommended), grant microphone/camera permissions, and have access to their chosen AI provider. Provider quotas, model availability, and browser CORS rules still apply.

## Local development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. For a static production build matching the project URL:

```bash
NEXT_PUBLIC_BASE_PATH=/Virtual-AI-Mock-Interview npm run build
```

Serve `out/` as static files mounted at `/Virtual-AI-Mock-Interview/`; `next start` does not serve static exports. Omit `NEXT_PUBLIC_BASE_PATH` to build for a domain root. The build downloads Geist fonts; Google Fonts network access is required. In proxy-based cloud environments, `npm run build -- --webpack` uses the supported webpack builder and its font-fetch proxy support.

## Bring your own AI provider

Before choosing a role, select Google Gemini or an OpenAI-compatible provider and enter your own API key and model ID. Gemini keys are available from [Google AI Studio](https://aistudio.google.com/apikey); free-tier eligibility and limits vary. For OpenRouter use `https://openrouter.ai/api/v1` with `openrouter/free`, or enter another provider's HTTPS base URL and model ID (for example, `https://api.openai.com/v1`).

Requests use Gemini's `generateContent` API or the OpenAI-compatible `/chat/completions` API. Custom endpoints must allow browser requests through CORS. Keys remain only in tab memory, clear on refresh, and are sent directly to the chosen provider with interview text. You can change providers or clear the key from role selection. No shared application API key or `NEXT_PUBLIC_OPENROUTER_API_KEY` is required.

Provider adapter tests (Node.js 24):

```bash
node --test tests/providers.test.mjs
```
