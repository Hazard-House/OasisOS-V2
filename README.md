# OasisOS

OasisOS is a browser app for building web apps with an AI model. The editor, terminal, and preview run in the browser through [WebContainers](https://webcontainers.io/). This Railway service is that browser app. Generated projects do not need a separate sandbox service.

OasisOS is based on [bolt.diy](https://github.com/stackblitz-labs/bolt.diy). The original MIT license is in `LICENSE`.

## Run it locally

You need Node.js >= 22.12.0 and pnpm >= 9.15.9.

```bash
pnpm install
cp .env.example .env.local
# Replace the placeholder for the provider you use. Remove or comment out the rest.
pnpm run dev
```

Open http://localhost:5173.

The dev server is enough to click around. A prompt that writes code needs one AI provider key, set in `.env.local` or under Settings.

## Deploy on Railway

This repo ships as one container. `railway.toml` points Railway at the Dockerfile, and the server listens on `$PORT`.

1. Create a Railway project from this repo.
2. Add the env vars below on the service. You need at least one AI provider key.
3. Deploy. Railway builds the production image and runs `node scripts/preview-server.mjs`.

Set `VITE_PUBLIC_APP_URL` to the public Railway URL so browser API calls are allowed. `PORT` is set by Railway. Do not hardcode it.

WebContainers need a Chromium browser (Chrome, Edge, or another Chromium-based browser). There is no database in this app. Chats stay in the browser.

`pnpm audit` reports no critical advisories on the current lockfile.

## Env vars

The app starts with none of these set. Building an app needs one provider key. Providers stay off until you pick one during setup or turn one on in Settings.

| Variable | Required to build | What it is |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | One provider key is required | Anthropic Claude |
| `OPENAI_API_KEY` | One provider key is required | OpenAI |
| `GOOGLE_GENERATIVE_AI_API_KEY` | One provider key is required | Google Gemini |
| `OPEN_ROUTER_API_KEY` | One provider key is required | OpenRouter |
| `GROQ_API_KEY` | Optional provider | Groq |
| `DEEPSEEK_API_KEY` | Optional provider | DeepSeek |
| `MISTRAL_API_KEY` | Optional provider | Mistral |
| `XAI_API_KEY` | Optional provider | xAI |
| `COHERE_API_KEY` | Optional provider | Cohere |
| `TOGETHER_API_KEY` | Optional provider | Together API key. Also set `TOGETHER_API_BASE_URL`, for example `https://api.together.xyz/v1` |
| `TOGETHER_API_BASE_URL` | Required with Together | Together base URL, for example `https://api.together.xyz/v1` |
| `FIREWORKS_API_KEY` | Optional provider | Fireworks |
| `CEREBRAS_API_KEY` | Optional provider | Cerebras |
| `PERPLEXITY_API_KEY` | Optional provider | Perplexity |
| `MOONSHOT_API_KEY` | Optional provider | Moonshot |
| `ZAI_API_KEY` | Optional provider | Z.AI |
| `HuggingFace_API_KEY` | Optional provider | Hugging Face |
| `HYPERBOLIC_API_KEY` | Optional provider | Hyperbolic |
| `GITHUB_API_KEY` | Optional provider | GitHub Models |
| `AWS_BEDROCK_CONFIG` | Optional provider | AWS Bedrock JSON config |
| `OLLAMA_API_BASE_URL` | Optional local model | Ollama base URL |
| `LMSTUDIO_API_BASE_URL` | Optional local model | LM Studio base URL |
| `OPENAI_LIKE_API_BASE_URL` | Optional provider | OpenAI-compatible base URL |
| `OPENAI_LIKE_API_KEY` | Optional provider | OpenAI-compatible key |
| `VITE_PUBLIC_APP_URL` | Set this in production | Public origin used for CORS |
| `PORT` | Set by Railway | HTTP port |

These are optional and only matter if you connect the matching product in Settings:

`VITE_GITHUB_ACCESS_TOKEN`, `VITE_GITHUB_TOKEN_TYPE`, `VITE_GITLAB_ACCESS_TOKEN`, `VITE_GITLAB_URL`, `VITE_GITLAB_TOKEN_TYPE`, `VITE_VERCEL_ACCESS_TOKEN`, `VITE_NETLIFY_ACCESS_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_ACCESS_TOKEN`.

Keys typed into Settings are stored in browser cookies and sent to this app's server with chat requests. Use HTTPS on a shared deployment.

See `.env.example` for placeholders and links to each provider's key page.

## License

OasisOS keeps the upstream MIT license. Copyright (c) 2024 StackBlitz, Inc. and bolt.diy contributors. See `LICENSE`.

WebContainers has its own terms for commercial hosting. Read them before you use this beyond a proof of concept: https://webcontainers.io/enterprise
