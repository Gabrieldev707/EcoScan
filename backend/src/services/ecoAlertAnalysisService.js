const { ecoAlertAnalysisSchema } = require('../schemas/ecoAlertSchemas');

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const DEFAULT_TIMEOUT_MS = 20000;

function shouldUseGemini() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function shouldUseGroq() {
  return Boolean(process.env.GROQ_API_KEY);
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

function buildPrompt({ city, lat, lng, note }) {
  return [
    'Analise a imagem como uma ocorrencia urbana de limpeza publica no Brasil.',
    'O objetivo e registrar pontos com acumulo de lixo, descarte irregular, lixeira transbordando, entulho, bueiro obstruido ou residuo perigoso.',
    'Responda exclusivamente em JSON valido, sem markdown e sem texto fora do JSON.',
    '',
    'Regras:',
    '- Use a imagem como fonte principal.',
    '- Nao classifique item por item como reciclagem domestica; avalie a cena e a necessidade de acao publica.',
    '- Se nao houver lixo acumulado, descarte irregular ou problema urbano claro, retorne isActionable=false.',
    '- Nao identifique pessoas, placas, casas ou dados pessoais.',
    '- Nao invente orgaos, enderecos ou equipes especificas.',
    '- Severidade high significa risco sanitario, obstrucao, volume grande, residuo perigoso ou impacto em via publica.',
    '',
    'Tipos permitidos:',
    'illegal_dumping, overflowing_bin, street_litter, hazardous_waste, blocked_drain, other',
    '',
    'Entrada:',
    JSON.stringify({ city, lat, lng, note: note || '' }),
    '',
    'Saida obrigatoria:',
    '{',
    '  "isActionable": boolean,',
    '  "type": "illegal_dumping|overflowing_bin|street_litter|hazardous_waste|blocked_drain|other",',
    '  "severity": "low|medium|high",',
    '  "summary": "string",',
    '  "detectedItems": ["string"],',
    '  "risks": ["string"],',
    '  "recommendedAction": "string",',
    '  "confidence": number',
    '}',
  ].join('\n');
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

function validateAnalysis(raw, source) {
  return {
    ...ecoAlertAnalysisSchema.parse(raw),
    source,
  };
}

function buildGeminiParts(input) {
  return [
    { text: buildPrompt(input) },
    {
      inlineData: {
        mimeType: input.image.mimeType || 'image/jpeg',
        data: input.image.base64,
      },
    },
  ];
}

function buildGroqMessages(input) {
  return [
    {
      role: 'user',
      content: [
        { type: 'text', text: buildPrompt(input) },
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

async function analyzeWithGemini(input) {
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
      throw new Error('Gemini eco alert request failed');
    }

    const data = await response.json();
    return validateAnalysis(parseJsonResponse(getGeminiText(data)), 'gemini');
  } finally {
    timeout.clear();
  }
}

async function analyzeWithGroqVision(input) {
  const baseUrl = (process.env.GROQ_BASE_URL || DEFAULT_GROQ_BASE_URL).replace(/\/+$/, '');
  const model = process.env.GROQ_VISION_MODEL || DEFAULT_GROQ_VISION_MODEL;
  const timeout = buildTimeout(process.env.GROQ_TIMEOUT_MS);

  async function requestCompletion({ forceJson }) {
    const body = {
      model,
      messages: buildGroqMessages(input),
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

    if (!response.ok) {
      response = await requestCompletion({ forceJson: false });
    }

    if (!response.ok) {
      throw new Error('Groq eco alert request failed');
    }

    const data = await response.json();
    return validateAnalysis(parseJsonResponse(getGroqText(data)), 'groq_vision');
  } finally {
    timeout.clear();
  }
}

function fallbackAnalysis(input) {
  const note = input.note ? ' Observacao do usuario: ' + input.note : '';

  return validateAnalysis(
    {
      isActionable: true,
      type: 'other',
      severity: 'medium',
      summary: 'Registro recebido para revisao manual de possivel ponto de lixo urbano.' + note,
      detectedItems: ['residuos nao verificados'],
      risks: ['avaliacao pendente'],
      recommendedAction: 'Enviar para triagem humana e confirmar se exige equipe de limpeza urbana.',
      confidence: 0.3,
    },
    'fallback',
  );
}

async function analyzeEcoAlert(input) {
  if (shouldUseGemini()) {
    try {
      return await analyzeWithGemini(input);
    } catch {
      // Keep report creation available when the provider is temporarily unavailable.
    }
  }

  if (shouldUseGroq()) {
    try {
      return await analyzeWithGroqVision(input);
    } catch {
      // Keep report creation available when the provider is temporarily unavailable.
    }
  }

  return fallbackAnalysis(input);
}

module.exports = {
  analyzeEcoAlert,
  analyzeWithGemini,
  analyzeWithGroqVision,
};
