/**
 * LLM pool: Ollama (local, free) → OpenRouter fallback.
 * Server-side only. Never import from client components.
 */

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';

export interface LlmOptions {
  maxTokens?: number;
  model?: string;
  temperature?: number;
}

async function callOllama(prompt: string, opts: LlmOptions): Promise<string> {
  const model = opts.model || OLLAMA_MODEL;
  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        num_predict: opts.maxTokens ?? 512,
        temperature: opts.temperature ?? 0.7,
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { response?: string };
  if (!data.response) throw new Error('Ollama: empty response');
  return data.response.trim();
}

async function callOpenRouter(prompt: string, opts: LlmOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://kbazar24.com',
      'X-Title': 'Kbazar Korean Cosmetics Store',
    },
    body: JSON.stringify({
      model: opts.model || OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: opts.maxTokens ?? 512,
      temperature: opts.temperature ?? 0.7,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenRouter: empty response');
  return text;
}

/**
 * Generate text using the available LLM pool.
 * Tries Ollama first (local/free), falls back to OpenRouter if Ollama fails.
 */
export async function generateText(prompt: string, opts: LlmOptions = {}): Promise<string> {
  try {
    return await callOllama(prompt, opts);
  } catch (ollamaErr) {
    if (process.env.OPENROUTER_API_KEY) {
      try {
        return await callOpenRouter(prompt, opts);
      } catch (orErr) {
        throw new Error(`Both providers failed. Ollama: ${ollamaErr}. OpenRouter: ${orErr}`);
      }
    }
    throw ollamaErr;
  }
}
