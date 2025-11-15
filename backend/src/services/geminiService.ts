// backend/src/services/geminiService.ts
/**
 * Production-ready Gemini service
 *
 * Responsibilities:
 *  - Call Google GenAI to generate a task plan from a user prompt
 *  - Ensure output is valid JSON conforming to the JSON_SCHEMA below
 *  - Attempt automatic repair when GenAI returns malformed JSON
 *  - Validate with Ajv
 *  - (Optional) Persist tasks to DB with Prisma
 *
 * Install required packages:
 *   npm install @google/genai ajv ajv-formats dotenv
 *   (Prisma client already in your project)
 *
 * Environment variables:
 *   GOOGLE_GENAI_API_KEY - API key for Google GenAI
 *   GENAI_MODEL - optional model id
 *
 * Note: adjust the GenAI client creation to match your installed SDK version.
 */

import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// ---------------------------
// JSON Schema for generated tasks
// ---------------------------

/**
 * Example GeneratedTask object:
 * {
 *  "title": "Design logo",
 *  "description": "Create a logo for the X project",
 *  "assignee": "alice@example.com" | null,
 *  "priority": "high" | "medium" | "low",
 *  "estimateHours": 4,
 *  "tags": ["design","branding"],
 *  "dueDate": "2025-12-01" | null
 * }
 */

type GeneratedTask = {
  title: string;
  description: string;
  assignee?: string | null;
  priority: 'high' | 'medium' | 'low';
  estimateHours?: number | null;
  tags?: string[];
  dueDate?: string | null; // ISO date string or null
};

const JSON_SCHEMA: JSONSchemaType<GeneratedTask[]> = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      assignee: { type: ['string', 'null'], nullable: true, default: null },
      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
      estimateHours: { type: ['number', 'null'], nullable: true, default: null },
      tags: { type: 'array', items: { type: 'string' }, nullable: true, default: [] },
      dueDate: { type: ['string', 'null'], nullable: true, default: null }
    },
    required: ['title', 'description', 'priority'],
    additionalProperties: false
  }
};

// Ajv validator
const ajv = new Ajv({ allErrors: true, removeAdditional: false });
addFormats(ajv);
const validate = ajv.compile(JSON_SCHEMA);

// ---------------------------
// GenAI client
// ---------------------------

const genaiApiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!genaiApiKey) {
  // Not throwing here in case you import this module in contexts where env isn't set,
  // but runtime calls will fail early with helpful message.
  console.warn('Warning: GOOGLE_GENAI_API_KEY is not set. GenAI calls will fail.');
}

const genai = new GoogleGenAI({
  apiKey: genaiApiKey
});

// Choose model via env var (fallback to a safe prototype name)
const GENAI_MODEL = process.env.GENAI_MODEL || 'gemini-prototype';

// ---------------------------
// Helpers: extract/repair/validate
// ---------------------------

/**
 * Extract JSON block from possibly-markdown-wrapped text.
 */
function extractJsonFromText(text: string): string | null {
  if (!text) return null;

  // Try to find ```json ... ``` or ``` ... ``` blocks first
  const fencedJson = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedJson && fencedJson[1]) return fencedJson[1].trim();

  // Try to find the first curly-block that looks like JSON (naive)
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const maybe = text.slice(firstBrace, lastBrace + 1).trim();
    // If it's an array at top-level, maybe starts with [
  }

  // If the model returned an array, try to find the first '[' ... ']'
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return text.slice(firstBracket, lastBracket + 1).trim();
  }

  return null;
}

/**
 * Attempt to repair common JSON formatting problems heuristically.
 * This is not guaranteed — prefer stricter prompt engineering and validation.
 */
function attemptJsonRepair(broken: string): string {
  let s = broken.trim();

  // Replace fancy quotes with normal quotes
  s = s.replace(/[\u2018\u2019\u201C\u201D]/g, '"');

  // Replace single quotes used for JSON keys/values -> double quotes
  // Cautious replace: only when it looks like JSON (key: 'value')
  s = s.replace(/(['"])?([a-zA-Z0-9_ -]+)\1\s*:/g, '"$2":'); // keys without quotes -> quote them
  s = s.replace(/:\s*'([^']*)'/g, ': "$1"'); // single-quoted values

  // Remove trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, '$1');

  // If top-level is an object but expected array, try to wrap
  const trimmed = s.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    // maybe the model returned a single object where an array expected; wrap it
    s = `[${s}]`;
  }

  // Safety: If there are multiple top-level JSON blocks, return the first valid one
  return s;
}

/**
 * Validate parsed object against JSON_SCHEMA. Returns array of errors when invalid.
 */
function validateAgainstSchema(obj: any): { valid: true } | { valid: false; errors: string[] } {
  const isValid = validate(obj);
  if (isValid) return { valid: true };
  const errors = (validate.errors || []).map((e) => `${e.instancePath || '/'} ${e.message}`);
  return { valid: false, errors };
}

// ---------------------------
// HIGH PRIORITY — main exported function
// ---------------------------

/**
 * HIGH PRIORITY — generateTaskPlan
 *
 * Calls the GenAI model with a strict system + user prompt instructing it to output JSON
 * matching the JSON_SCHEMA. Parses the response, attempts repairs on malformed JSON,
 * validates the final result, and returns the generated tasks with priority fields.
 *
 * Throws informative errors on failure.
 */
export async function generateTaskPlan(
  prompt: string,
  opts?: { maxRetries?: number; temperature?: number }
): Promise<GeneratedTask[]> {
  const maxRetries = opts?.maxRetries ?? 2;
  const temperature = opts?.temperature ?? 0.2;

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('generateTaskPlan: prompt must be a non-empty string');
  }

  // Compose strict system/user message to encourage valid JSON output
  const systemInstr = `
You are a JSON-only generator. Respond ONLY with valid JSON following this structure:
An ARRAY of task objects. Each task object MUST contain: title (string), description (string), priority (one of "high","medium","low").
Optional fields: assignee (email or null), estimateHours (number), tags (array of strings), dueDate (ISO date string or null).
Do NOT include any extra keys. Do NOT add explanation text, markdown fences, or commentary.
If you cannot determine a field, set it to null or reasonable default.
Return only the JSON array as the final output.
`;

  // build the actual prompt content passed to GenAI: combine systemInstr with user prompt
  const userMessage = `User Request: ${prompt}\n\nNow generate the JSON array described above.`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // NOTE: adapt below call to whichever method your GoogleGenAI SDK expects.
      // This code assumes a simple text generation call that returns `text` or `content`.
      const response = await genai.generateText({
        model: GENAI_MODEL,
        // The API shape will differ per SDK; adjust to your SDK version.
        // Many SDKs use messages: [{ role: 'system', content: systemInstr }, { role: 'user', content: userMessage }]
        // Here we use a "messages" style payload if supported.
        messages: [
          { role: 'system', content: systemInstr },
          { role: 'user', content: userMessage }
        ],
        temperature,
        maxOutputTokens: 1200
      } as any);

      // Extract text content — SDKs return different shapes (adjust as needed)
      const rawText = (response?.outputText ?? response?.text ?? response?.content ?? (() => {
        // Try to find a likely field in response
        if (response && typeof response === 'object') {
          // pick the first stringified field
          for (const k of Object.keys(response)) {
            if (typeof (response as any)[k] === 'string') {
              return (response as any)[k];
            }
          }
        }
        return '';
      })()) as string;

      if (!rawText || rawText.trim().length === 0) {
        throw new Error('GenAI returned empty response text');
      }

      // First, try to extract JSON block
      let jsonText = extractJsonFromText(rawText) ?? rawText.trim();

      // Try parse directly
      try {
        const parsed = JSON.parse(jsonText);
        const validation = validateAgainstSchema(parsed);
        if (validation.valid) {
          return parsed as GeneratedTask[];
        } else {
          // invalid shape; throw to go to repair path
          throw new Error('Schema validation failed: ' + validation.errors.join('; '));
        }
      } catch (parseErr) {
        // Try repair heuristics
        const repaired = attemptJsonRepair(jsonText);
        try {
          const parsed2 = JSON.parse(repaired);
          const validation2 = validateAgainstSchema(parsed2);
          if (validation2.valid) {
            return parsed2 as GeneratedTask[];
          } else {
            throw new Error('Schema validation failed after repair: ' + validation2.errors.join('; '));
          }
        } catch (finalErr) {
          // Last resort: attempt to salvage using regex to find array-like substring
          const bracketStart = repaired.indexOf('[');
          const bracketEnd = repaired.lastIndexOf(']');
          if (bracketStart !== -1 && bracketEnd !== -1 && bracketEnd > bracketStart) {
            const candidate = repaired.slice(bracketStart, bracketEnd + 1);
            try {
              const parsed3 = JSON.parse(candidate);
              const validation3 = validateAgainstSchema(parsed3);
              if (validation3.valid) {
                return parsed3 as GeneratedTask[];
              }
            } catch (_) {
              // continue to throw below
            }
          }

          // If we reach here, parsing failed
          throw new Error(
            `Failed to parse/validate GenAI response. parseErr:${(parseErr as Error).message}; finalErr:${(finalErr as Error).message}`
          );
        }
      }
    } catch (err: any) {
      lastError = err;
      // Simple retry/backoff: small delay (can be improved to exponential)
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, 500 + attempt * 500));
        continue;
      } else {
        console.error('generateTaskPlan: final failure', err);
        throw new Error(`generateTaskPlan failed after ${maxRetries + 1} attempts: ${err.message || err}`);
      }
    }
  }

  // unreachable
  throw lastError ?? new Error('generateTaskPlan: unknown failure');
}

// ---------------------------
// Optional: persist generated tasks into DB with Prisma
// ---------------------------

/**
 * Persist an array of GeneratedTask into your DB.
 * Adjust mapping to your Prisma schema fields.
 */
export async function createTasksInDb(tasks: GeneratedTask[], projectId?: number, teamId?: number) {
  if (!Array.isArray(tasks)) throw new Error('createTasksInDb expects an array of tasks');

  const created = [];
  for (const t of tasks) {
    const record = await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        priority: t.priority,
        estimateHours: t.estimateHours ?? null,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        // These fields depend on your prisma schema. Replace or remove as needed:
        projectId: projectId ?? undefined,
        teamId: teamId ?? undefined,
        assigneeEmail: t.assignee ?? null,
        tags: t.tags ?? []
      }
    });
    created.push(record);
  }
  return created;
}

// ---------------------------
// Export type for convenience
// ---------------------------
export type { GeneratedTask };

