const fallbackClassifierService = require('./fallbackClassifierService');
const { classificationResultSchema } = require('../schemas/classificationSchema');

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const DEFAULT_GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const DEFAULT_TIMEOUT_MS = 20000;

function buildPrompt({ wasteType, city, lat, lng, image }) {
  const hasUserDescription = Boolean(wasteType?.trim());

  return [
    'Classifique o residuo informado pelo usuario para descarte correto no Brasil.',
    'Responda exclusivamente em JSON valido, sem markdown, sem explicacoes fora do JSON.',
    '',
    'Regras importantes:',
    '- Se houver imagem, use a imagem como fonte principal e o texto como contexto.',
    '- Se o usuario nao informou wasteType, identifique o residuo diretamente pela imagem e preencha wasteType/identifiedItem.',
    '- Identifique o objeto real observado ou descrito em identifiedItem. Exemplos: saco de pipoca, papel higienico usado, garrafa PET, lata de aluminio.',
    '- Informe material de forma curta. Exemplos: plastico, papel contaminado, metal, vidro, organico, misto.',
    '- Se o item/cidade forem inventados, sem sentido, impossiveis ou insuficientes para descarte, retorne isValidWaste=false, confidence baixo, points=0 e explique em reason.',
    '- Nao invente ecopontos, enderecos ou regras municipais especificas.',
    '- Para embalagem suja, guardanapo/papel higienico/fralda/esponja/bituca, normalmente e Rejeito/Cinza.',
    '',
    'Categorias permitidas:',
    'Plástico, Papel, Metal, Vidro, Orgânico, Rejeito',
    '',
    'Cores:',
    'Plástico = Vermelho',
    'Papel = Azul',
    'Metal = Amarelo',
    'Vidro = Verde',
    'Orgânico = Marrom',
    'Rejeito = Cinza',
    '',
    'Entrada:',
    JSON.stringify({
      wasteType: hasUserDescription ? wasteType : 'nao informado pelo usuario; identificar pela imagem',
      city,
      lat,
      lng,
      imageProvided: Boolean(image?.base64),
    }),
    '',
    'Saida obrigatoria:',
    '{',
    '  "isValidWaste": boolean,',
    '  "wasteType": "string",',
    '  "identifiedItem": "string",',
    '  "material": "string",',
    '  "category": "Plástico|Papel|Metal|Vidro|Orgânico|Rejeito",',
    '  "binColor": "string",',
    '  "canRecycle": boolean,',
    '  "points": number,',
    '  "disposalGuide": "string",',
    '  "reason": "string",',
    '  "confidence": number',
    '}',
  ].join('\n');
}

function shouldUseGemini() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function shouldUseGroq() {
  return Boolean(process.env.GROQ_API_KEY);
}

function hasImage(input) {
  return Boolean(input.image?.base64);
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
  const inputWasteType = input.wasteType?.trim();
  const modelWasteType = validated.wasteType?.trim();
  const identifiedItem = validated.identifiedItem || modelWasteType || inputWasteType || 'Residuo identificado pela imagem';

  return {
    ...validated,
    wasteType: inputWasteType || modelWasteType || identifiedItem,
    identifiedItem,
    material: validated.material || 'nao identificado',
    reason: validated.reason || 'Classificacao gerada pela IA.',
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

function parseJsonResponse(text) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedJson) {
      return JSON.parse(fencedJson[1].trim());
    }

    const objectStart = trimmed.indexOf('{');
    const objectEnd = trimmed.lastIndexOf('}');
    if (objectStart >= 0 && objectEnd > objectStart) {
      return JSON.parse(trimmed.slice(objectStart, objectEnd + 1));
    }

    throw error;
  }
}

function buildGeminiParts(input) {
  const parts = [{ text: buildPrompt(input) }];

  if (input.image?.base64) {
    parts.push({
      inlineData: {
        mimeType: input.image.mimeType || 'image/jpeg',
        data: input.image.base64,
      },
    });
  }

  return parts;
}

function buildGroqMessages(input, { vision = false } = {}) {
  const prompt = buildPrompt(input);

  if (!vision || !input.image?.base64) {
    return [
      {
        role: 'user',
        content: prompt,
      },
    ];
  }

  return [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: 'data:' + (input.image.mimeType || 'image/jpeg') + ';base64,' + input.image.base64,
          },
        },
      ],
    },
  ];
}

async function classifyWithGemini(input) {
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const timeout = buildTimeout(process.env.GEMINI_TIMEOUT_MS);

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(process.env.GEMINI_API_KEY);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: timeout.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: buildGeminiParts(input),
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
    return validateClassification(parseJsonResponse(text), input, 'gemini');
  } finally {
    timeout.clear();
  }
}

async function classifyWithGroq(input, { vision = false } = {}) {
  const baseUrl = (process.env.GROQ_BASE_URL || DEFAULT_GROQ_BASE_URL).replace(/\/+$/, '');
  const model = vision
    ? process.env.GROQ_VISION_MODEL || DEFAULT_GROQ_VISION_MODEL
    : process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const timeout = buildTimeout(process.env.GROQ_TIMEOUT_MS);

  async function requestCompletion({ forceJson }) {
    const body = {
      model,
      messages: buildGroqMessages(input, { vision }),
      temperature: 0.1,
    };

    if (forceJson) {
      body.response_format = { type: 'json_object' };
    }

    return fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.GROQ_API_KEY,
      },
      signal: timeout.signal,
      body: JSON.stringify(body),
    });
  }

  try {
    let response = await requestCompletion({ forceJson: true });

    if (!response.ok && vision) {
      response = await requestCompletion({ forceJson: false });
    }

    if (!response.ok) {
      throw new Error('Groq classification request failed');
    }

    const data = await response.json();
    const text = getGroqText(data);
    return validateClassification(parseJsonResponse(text), input, vision ? 'groq_vision' : 'groq');
  } finally {
    timeout.clear();
  }
}

function classifyWithGroqVision(input) {
  return classifyWithGroq(input, { vision: true });
}

async function classifyWaste(input) {
  if (hasImage(input)) {
    if (shouldUseGemini()) {
      try {
        return await classifyWithGemini(input);
      } catch {
        // Provider errors and raw model responses are intentionally not logged.
      }
    }

    if (shouldUseGroq()) {
      try {
        return await classifyWithGroqVision(input);
      } catch {
        // Provider errors and raw model responses are intentionally not logged.
      }
    }

    return fallbackClassifierService.classifyWaste(input);
  }

  if (shouldUseGroq()) {
    try {
      return await classifyWithGroq(input);
    } catch {
      // Provider errors and raw model responses are intentionally not logged.
    }
  }

  if (shouldUseGemini()) {
    try {
      return await classifyWithGemini(input);
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
  classifyWithGroqVision,
};
