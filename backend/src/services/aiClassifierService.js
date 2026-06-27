const fallbackClassifierService = require('./fallbackClassifierService');
const { classificationResultSchema } = require('../schemas/classificationSchema');

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const DEFAULT_TIMEOUT_MS = 8000;

function buildPrompt({ wasteType, city }) {
  return `Classifique o resíduo informado pelo usuário para descarte correto no Brasil.
Responda exclusivamente em JSON válido, sem markdown, sem explicações.

Categorias permitidas:
Plástico, Papel, Metal, Vidro, Orgânico, Rejeito

Cores:
Plástico = Vermelho
Papel = Azul
Metal = Amarelo
Vidro = Verde
Orgânico = Marrom
Rejeito = Cinza

Entrada:
${JSON.stringify({ wasteType, city })}

Saída obrigatória:
{
  "wasteType": "string",
  "category": "Plástico|Papel|Metal|Vidro|Orgânico|Rejeito",
  "binColor": "string",
  "canRecycle": boolean,
  "points": number,
  "disposalGuide": "string",
  "confidence": number
}`;
}

function hasProviderConfig(provider, key) {
  return provider === key && Boolean(process.env[`${key.toUpperCase()}_API_KEY`]);
}

function shouldUseGemini() {
  return hasProviderConfig(process.env.AI_PROVIDER, 'gemini');
}

function shouldUseGroq() {
  return hasProviderConfig(process.env.AI_FALLBACK_PROVIDER, 'groq');
}

function buildTimeout(ms) {
  const timeoutMs = Number(ms || DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

function validateClassification(raw, input, source) {
  const validated = classificationResultSchema.parse(raw);

  return {
    ...validated,
    wasteType: input.wasteType.trim(),
    source,
  };
}

function getGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';

  return parts
    .map((part) => (typeof part.text === 'string' ? part.text : ''))
    .join('')
    .trim();
}

function getGroqText(data) {
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function classifyWithGemini(input) {
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const timeout = buildTimeout(process.env.GEMINI_TIMEOUT_MS);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: timeout.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(input) }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Gemini classification request failed');
    }

    const data = await response.json();
    const text = getGeminiText(data);
    return validateClassification(JSON.parse(text), input, 'gemini');
  } finally {
    timeout.clear();
  }
}

async function classifyWithGroq(input) {
  const baseUrl = (process.env.GROQ_BASE_URL || DEFAULT_GROQ_BASE_URL).replace(/\/+$/, '');
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const timeout = buildTimeout(process.env.GROQ_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      signal: timeout.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: buildPrompt(input),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq classification request failed');
    }

    const data = await response.json();
    const text = getGroqText(data);
    return validateClassification(JSON.parse(text), input, 'groq');
  } finally {
    timeout.clear();
  }
}

async function classifyWaste(input) {
  if (shouldUseGemini()) {
    try {
      return await classifyWithGemini(input);
    } catch {
      // Provider errors and raw model responses are intentionally not logged.
    }
  }

  if (shouldUseGroq()) {
    try {
      return await classifyWithGroq(input);
    } catch {
      // Provider errors and raw model responses are intentionally not logged.
    }
  }

  return fallbackClassifierService.classifyWaste(input);
}

module.exports = {
  classifyWaste,
  classifyWithGemini,
  classifyWithGroq,
};
