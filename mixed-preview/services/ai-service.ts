import { AIConfig } from '../types/ai-config';

const STORAGE_KEY = 'mixed-preview-ai-config';

export function loadAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const config = JSON.parse(raw) as AIConfig;
    if (config.provider && config.endpoint && config.apiKey && config.model) {
      return config;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

const SYSTEM_PROMPT = `You are an expert in Markdown, HTML, JSON, and Mermaid.js syntax. Fix the syntax error in the provided code.
RULES:
1. Return ONLY the raw corrected code.
2. Do not wrap the entire response in Markdown code blocks unless the original code was wrapped.
3. Do not provide explanations.
4. Preserve the original logic/intent as much as possible, only fix the syntax.`;

function buildUserMessage(code: string, error: string): string {
  return `CODE:\n${code}\n\nERROR:\n${error}`;
}

async function callOpenAICompatible(
  config: AIConfig,
  code: string,
  error: string,
): Promise<string> {
  const endpoint = config.endpoint.replace(/\/+$/, '');
  const res = await fetch(`${endpoint}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(code, error) },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

async function callAnthropic(config: AIConfig, code: string, error: string): Promise<string> {
  const endpoint = config.endpoint.replace(/\/+$/, '');
  const res = await fetch(`${endpoint}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(code, error) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
  return textBlock?.text?.trim() ?? '';
}

export async function fixCodeWithAI(
  config: AIConfig,
  code: string,
  error: string,
): Promise<string> {
  if (config.provider === 'anthropic') {
    return callAnthropic(config, code, error);
  }
  return callOpenAICompatible(config, code, error);
}
