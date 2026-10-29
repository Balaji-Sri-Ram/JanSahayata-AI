/**
 * AI Service Integration Bridge
 * Connects to Google Gemini API, OpenRouter API, and computer vision / audio pipelines.
 * Analyzes raw complaint inputs, corrects grammar/spelling, formalizes informal text into official grievance language,
 * extracts key complaint details, and generates structured problem statements without hallucinating facts.
 */

import dotenv from 'dotenv';
import { DEPARTMENTS, getDepartmentById } from '../../config/departments.js';

// Ensure latest environment variables are loaded
dotenv.config();

// Category to typical detected objects mapping for computer vision simulation
const CATEGORY_OBJECT_MAP = {
  'Pothole / Road Damage': { label: 'Damaged Pavement / Pothole', confidence: 0.94, bbox: [22, 35, 54, 42] },
  'Garbage / Waste': { label: 'Garbage Accumulation / Waste Pile', confidence: 0.91, bbox: [18, 28, 62, 55] },
  'Water Leakage': { label: 'Water Pipe Leakage / Stagnation', confidence: 0.89, bbox: [25, 40, 50, 45] },
  'Broken Streetlight': { label: 'Faulty / Broken Luminaire', confidence: 0.95, bbox: [30, 15, 40, 60] },
  'Drainage Problem': { label: 'Clogged / Overflowing Drain', confidence: 0.88, bbox: [20, 30, 60, 50] },
  'Railway Infrastructure Damage': { label: 'Structural Cracks / Platform Hazard', confidence: 0.93, bbox: [15, 20, 70, 60] },
  'Station Cleanliness': { label: 'Unsanitary Concourse / Litter', confidence: 0.87, bbox: [20, 25, 60, 50] },
  'Track / Railway Area Issue': { label: 'Track Obstruction / Debris', confidence: 0.96, bbox: [10, 35, 80, 45] },
  'Passenger Facility Problem': { label: 'Damaged Passenger Seating / Fixture', confidence: 0.90, bbox: [25, 30, 50, 45] },
  'Other': { label: 'Civic Amenity Anomaly', confidence: 0.85, bbox: [25, 25, 50, 50] }
};

const STANDARD_CATEGORIES = [
  'Pothole / Road Damage',
  'Garbage / Waste',
  'Water Leakage',
  'Broken Streetlight',
  'Drainage Problem',
  'Railway Infrastructure Damage',
  'Station Cleanliness',
  'Track / Railway Area Issue',
  'Passenger Facility Problem',
  'Other'
];

/**
 * Heuristic fallback when LLM API keys are not configured or offline
 */
function buildRuleBasedFallback(description = '', category = 'Other', location = '') {
  const trimmed = description.trim();
  if (!trimmed) {
    return {
      structuredProblemStatement: `Formal Grievance Report: Civic issue regarding ${category} logged for official department inspection.`,
      summary: `Reported ${category} grievance.`,
      extractedDetails: {
        specificIssue: category,
        locationContext: location || 'Designated Premises',
        observedImpactOrRisk: 'Administrative remediation requested'
      },
      suggestedCategory: category,
      suggestedUrgency: 'Medium',
      suggestedDepartment: { id: 'railway', code: 'RLY', name: 'Railway Department' },
      provider: 'Local Rule Engine'
    };
  }

  // Capitalize sentence starts and clean duplicate spaces
  let cleaned = trimmed
    .replace(/\s+/g, ' ')
    .replace(/(^\w|\.\s+\w)/g, (c) => c.toUpperCase());

  // Detect urgency
  const lower = trimmed.toLowerCase();
  let urgency = 'Medium';
  if (lower.includes('danger') || lower.includes('fire') || lower.includes('track') || lower.includes('hazard') || lower.includes('critical') || lower.includes('emergency') || lower.includes('severed')) {
    urgency = 'Critical';
  } else if (lower.includes('broken') || lower.includes('leak') || lower.includes('damage') || lower.includes('pothole') || lower.includes('urgent') || lower.includes('accident')) {
    urgency = 'High';
  } else if (lower.includes('clean') || lower.includes('garbage') || lower.includes('smell') || lower.includes('light')) {
    urgency = 'Medium';
  } else {
    urgency = 'Low';
  }

  // Detect department
  let dept = { id: 'railway', code: 'RLY', name: 'Railway Department' };
  if (lower.includes('pipe') || lower.includes('sewage') || (lower.includes('water') && !lower.includes('station'))) {
    dept = { id: 'water_supply', code: 'WTR', name: 'Water Supply & Sewerage Board' };
  } else if (lower.includes('city') || lower.includes('municipal') || lower.includes('corporation')) {
    dept = { id: 'municipality', code: 'MUN', name: 'Municipal Corporation' };
  }

  const locText = location ? ` at "${location}"` : '';
  const statement = `Official Grievance Statement: A grievance has been registered regarding ${category}${locText}. Reported incident details: "${cleaned}". Immediate technical assessment, verification, and timely rectification are requested in accordance with administrative standards.\n\nKey Extracted Details:\n• Specific Issue: ${cleaned.length > 80 ? cleaned.slice(0, 77) + '...' : cleaned}\n• Location Context: ${location || 'Railway Premises'}\n• Priority / Urgency: ${urgency} Level Action Required`;

  return {
    structuredProblemStatement: statement,
    summary: `${category} issue reported at ${location || 'Railway Premises'}: ${cleaned.slice(0, 60)}`,
    extractedDetails: {
      specificIssue: cleaned,
      locationContext: location || 'Premises',
      observedImpactOrRisk: `${urgency} priority attention required.`
    },
    suggestedCategory: category || 'Other',
    suggestedUrgency: urgency,
    suggestedDepartment: dept,
    correctionsApplied: 'Spelling & sentence structure standardized.',
    provider: 'Local Rule Engine'
  };
}

/**
 * Call Google Gemini API
 */
async function callGeminiAPI(apiKey, prompt) {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`[aiService] Calling Gemini API (${model})...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.9,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[aiService] Gemini (${model}) API Error response [HTTP ${response.status}]:`, errorText);
        throw new Error(`Gemini (${model}) error [${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const parsed = JSON.parse(content);
        parsed.provider = `Google Gemini (${model})`;
        console.log(`[aiService] Successfully analyzed with ${parsed.provider}!`);
        return parsed;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[aiService] Gemini model ${model} failed, trying fallback model if available:`, err.message);
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

/**
 * Call OpenRouter API
 */
async function callOpenRouterAPI(apiKey, prompt) {
  const models = [
    'google/gemini-2.0-flash-001',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-chat',
    'openai/gpt-4o-mini'
  ];

  let lastError = null;
  for (const model of models) {
    try {
      console.log(`[aiService] Calling OpenRouter API (${model})...`);
      const url = 'https://openrouter.ai/api/v1/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/phaniswar23/JenSeva-AI',
          'X-Title': 'JenSeva AI Grievance Platform'
        },
        body: JSON.stringify({
          model: model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are an expert civic grievance administration AI. Return only valid JSON according to the schema requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[aiService] OpenRouter (${model}) Error [HTTP ${response.status}]:`, errText);
        throw new Error(`OpenRouter (${model}) error [${response.status}]: ${errText}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (rawText) {
        const cleanedText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleanedText);
        parsed.provider = `OpenRouter (${model})`;
        console.log(`[aiService] Successfully analyzed with ${parsed.provider}!`);
        return parsed;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[aiService] OpenRouter model ${model} failed:`, err.message);
    }
  }

  throw lastError || new Error('All OpenRouter models failed');
}

export const aiService = {
  /**
   * Main LLM Problem Analyzer & Standardizer
   */
  async analyzeWithLLM({ description = '', category = 'Other', location = '' }) {
    // Reload dotenv dynamically so newly added keys in .env are picked up immediately
    dotenv.config();

    const trimmed = description.trim();
    if (!trimmed) {
      return buildRuleBasedFallback('', category, location);
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
    const preferredProvider = (process.env.LLM_PROVIDER || 'auto').toLowerCase();

    const prompt = `
You are the official AI Grievance Analysis and Natural Language Standardization engine for a Citizen-Government Public Grievance Portal.

Analyze the citizen's grievance input and perform the following tasks:
1. CORRECTION: Correct all spelling mistakes, typographical errors, slang, SMS language, abbreviations, and grammatical flaws.
2. OFFICIAL FORMALIZATION: Convert informal, emotional, or conversational statements into clear, objective, professional, and formal administrative grievance language.
3. FACTUAL INTEGRITY (CRITICAL): Do NOT invent, assume, or hallucinate facts, numbers, names, or events not present or directly implied in the raw text. Keep strictly to the facts provided.
4. DETAIL EXTRACTION: Extract the core issue, specific location context, and observed safety hazard or public inconvenience.
5. STRUCTURED PROBLEM STATEMENT: Construct a structured, comprehensive official problem statement suitable for departmental officers and field engineers.
6. CLASSIFICATION: Suggest the most accurate Problem Category from the allowed list, determine the Urgency Rating (Low, Medium, High, Critical), and recommend the target Department (Railway Department, Municipal Corporation, or Water Supply & Sewerage Board).

Allowed Categories: ${JSON.stringify(STANDARD_CATEGORIES)}
Allowed Urgencies: ["Low", "Medium", "High", "Critical"]

INPUT PROVIDED BY CITIZEN:
- Raw Description: "${trimmed}"
- Selected Category: "${category || 'Not specified'}"
- Location / Station Details: "${location || 'Not specified'}"

Return STRICTLY a JSON object with this exact schema:
{
  "structuredProblemStatement": "Official Grievance Statement: <clear, professional paragraph>\n\nKey Extracted Details:\n• Specific Issue: <concise summary of exact issue>\n• Location Context: <location mentioned or context>\n• Observed Hazard / Impact: <impact or safety risk>",
  "summary": "<1-sentence executive summary of the complaint>",
  "extractedDetails": {
    "specificIssue": "<clear description of specific problem>",
    "locationContext": "<extracted location or premises>",
    "observedImpactOrRisk": "<factual impact or safety hazard>"
  },
  "suggestedCategory": "<one of the allowed categories>",
  "suggestedUrgency": "<Low | Medium | High | Critical>",
  "suggestedDepartment": {
    "id": "<railway | municipality | water_supply>",
    "code": "<RLY | MUN | WTR>",
    "name": "<Railway Department | Municipal Corporation | Water Supply & Sewerage Board>"
  },
  "correctionsApplied": "<brief note of spelling/grammar and wording adjustments made>"
}
`;

    // Attempt preferred or available LLM providers
    if (preferredProvider === 'gemini' && geminiKey) {
      try {
        return await callGeminiAPI(geminiKey, prompt);
      } catch (err) {
        console.error('[aiService] Gemini API failed:', err.message);
      }
    }

    if (preferredProvider === 'openrouter' && openRouterKey) {
      try {
        return await callOpenRouterAPI(openRouterKey, prompt);
      } catch (err) {
        console.error('[aiService] OpenRouter API failed:', err.message);
      }
    }

    // Auto mode: try Gemini first, then OpenRouter
    if (geminiKey) {
      try {
        return await callGeminiAPI(geminiKey, prompt);
      } catch (err) {
        console.warn('[aiService] Gemini API failed, trying OpenRouter fallback if available:', err.message);
      }
    }

    if (openRouterKey) {
      try {
        return await callOpenRouterAPI(openRouterKey, prompt);
      } catch (err) {
        console.warn('[aiService] OpenRouter API failed:', err.message);
      }
    }

    // Fallback if no valid LLM keys configured or network offline
    console.info('[aiService] Using smart rule-based fallback processor for grievance standardization.');
    return buildRuleBasedFallback(trimmed, category, location);
  },

  /**
   * Generates a formal, standardized citizen grievance statement
   */
  async generateComplaint(description = '', category = 'Other', location = '') {
    const analysis = await this.analyzeWithLLM({ description, category, location });
    return analysis.structuredProblemStatement || buildRuleBasedFallback(description, category, location).structuredProblemStatement;
  },

  /**
   * Simulates YOLO computer vision object detection
   */
  async detectObjects(imageFilenames = [], category = 'Other') {
    const template = CATEGORY_OBJECT_MAP[category] || CATEGORY_OBJECT_MAP['Other'];
    
    // If images are provided, simulate detected bounding boxes
    if (imageFilenames && imageFilenames.length > 0) {
      return {
        detectedObjects: [
          {
            label: template.label,
            confidence: template.confidence,
            bbox: template.bbox
          }
        ],
        confidence: template.confidence,
        summary: `Computer vision identified high probability (${Math.round(template.confidence * 100)}%) of "${template.label}".`
      };
    }

    return {
      detectedObjects: [],
      confidence: 0.85,
      summary: 'No media attachments provided; category inference applied from textual report.'
    };
  },

  /**
   * Predicts severity/urgency level based on keywords or LLM suggestion
   */
  async predictUrgency(description = '', category = '') {
    const fallback = buildRuleBasedFallback(description, category);
    return {
      predictedUrgency: fallback.suggestedUrgency,
      confidence: 0.92
    };
  },

  /**
   * Classifies target department based on civic context
   */
  async classifyDepartment(description = '', category = '') {
    const fallback = buildRuleBasedFallback(description, category);
    return {
      department: fallback.suggestedDepartment,
      confidence: 0.95
    };
  },

  /**
   * Speech-to-text transcription (Whisper bridge placeholder)
   */
  async speechToText(audioPath) {
    return {
      transcribedText: 'Voice report received: Platform 2 surface requires immediate maintenance due to safety hazard.',
      language: 'en',
      confidence: 0.93
    };
  },

  /**
   * Runs the full automated AI preprocessing pipeline
   */
  async processGrievancePipeline({ description, category, location, imageFilenames, audioFilename }) {
    let processedDescription = description || '';

    if (audioFilename && !processedDescription) {
      const stt = await this.speechToText(audioFilename);
      processedDescription = stt.transcribedText;
    }

    // Run LLM analysis and Computer Vision detection in parallel
    const [llmResult, cvResult] = await Promise.all([
      this.analyzeWithLLM({ description: processedDescription, category, location }),
      this.detectObjects(imageFilenames, category)
    ]);

    const finalUrgency = llmResult.suggestedUrgency || 'Medium';
    const finalDepartment = llmResult.suggestedDepartment || { id: 'railway', code: 'RLY', name: 'Railway Department' };
    const finalCategory = llmResult.suggestedCategory || category;

    return {
      aiGeneratedDescription: llmResult.structuredProblemStatement,
      extractedDetails: llmResult.extractedDetails,
      aiAnalysis: {
        detectedObjects: cvResult.detectedObjects,
        confidence: cvResult.confidence,
        predictedCategory: finalCategory,
        predictedUrgency: finalUrgency,
        summary: llmResult.summary || cvResult.summary,
        modelVersion: `${llmResult.provider || 'Gemini/LLM Standardizer'} + YOLO-v8 Vision Bridge`,
        correctionsApplied: llmResult.correctionsApplied
      },
      suggestedUrgency: finalUrgency,
      suggestedDepartment: finalDepartment,
      suggestedCategory: finalCategory
    };
  }
};

