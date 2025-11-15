import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const prisma = new PrismaClient();

// --- JSON SCHEMA FOR TASK GENERATION ---
const JSON_SCHEMA = {
    type: "array",
    items: {
        type: "object",
        properties: {
            title: { type: "string" },
            description: { type: "string" },
            estimatedHours: { type: "number" },
            requiredSkills: { 
                type: "object",
                description: "Map of skillName → proficiency score (0.0–1.0)",
                additionalProperties: { type: "number" }
            },
            idealAssigneeName: { type: "string" },
        },
        required: ["title", "description", "estimatedHours", "requiredSkills", "idealAssigneeName"],
    },
};

// --- SYSTEM PROMPT (AI BEHAVIOR TRAINING) ---
const SYSTEM_PROMPT = `
You are an elite AI Project Manager working inside a workflow automation system.

Your responsibilities:
- Read project goals and team capability descriptions.
- Break projects into clean, well-structured tasks.
- Determine required skills for each task.
- Choose the ideal assignee based on the user’s team description.
- Never be vague, generic, or verbose.
- Never hallucinate unknown team members.
- Always output strictly formatted JSON inside a \`\`\`json code block.
- Each task must include: title, description, estimatedHours, requiredSkills, idealAssigneeName.

Tone:
- Confident
- Professional
- Clear
- Deterministic (consistent output every time)
`;


// --- GEMINI CLIENT INITIALIZATION ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


// =====================================================
// ⭐ NEW: GENERIC WRAPPER USING SYSTEM PROMPT
// =====================================================

export async function generateWithSystemPrompt(userPrompt: string, context: any = {}) {
  const model = geminiClient.models.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const fullPrompt = `
${SYSTEM_PROMPT}

User Prompt:
${userPrompt}

Context:
${JSON.stringify(context, null, 2)}
  `;

  const response = await model.generateContent({
    contents: fullPrompt,
    config: { temperature: 0.2 }
  });

  return response.text;
}



// =====================================================
// ⭐ MAIN FUNCTION: GENERATE A TASK PLAN FOR A PROJECT
// =====================================================

export async function generateTaskPlan(projectId: string, userInput: string) {
  try {
    // Step 1: Fetch project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    const projectGoal = project.goal;
    const projectTitle = project.title;

    // Step 2: Build the new SYSTEM-PROMPTED user request
    const prompt = `
Generate a task breakdown for this project.

Project Title: "${projectTitle}"
Goal: "${projectGoal}"
Team Skills / Capabilities (provided by user): "${userInput}"

Output Requirements:
- Return ONLY a JSON array.
- Wrap JSON inside \`\`\`json code fences.
- Follow this schema strictly:

{
  "title": "Task Title",
  "description": "Detailed explanation",
  "estimatedHours": 8,
  "requiredSkills": { "skillName": 0.8 },
  "idealAssigneeName": "Alice"
}

No explanations outside JSON.
`;

    // Step 3: Call Gemini through the pre-prompted wrapper
    const responseText = await generateWithSystemPrompt(prompt, {
      projectTitle,
      projectGoal,
      userInput,
    });

    if (!responseText) {
      throw new Error("Gemini API returned no content.");
    }

    // Step 4: Extract JSON from code fences
    const jsonString = responseText.replace(/```json|```/g, "").trim();

    // Step 5: Parse JSON
    const generatedTasks = JSON.parse(jsonString);

    return generatedTasks;

  } catch (error: any) {
    console.error("Error generating task plan:", error.message || error);
    throw new Error(`Failed to generate task plan: ${error.message || 'Unknown error'}`);
  }
}
