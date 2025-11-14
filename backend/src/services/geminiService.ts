import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const prisma = new PrismaClient();

// --- 1. JSON SCHEMA DEFINITION (MOVED HERE TO FIX SYNTAX ERROR) ---
// Define the strict JSON schema required for task creation by the Gemini API.
// backend/src/services/geminiService.ts

// Define the strict JSON schema required for task creation
// backend/src/services/geminiService.ts (JSON_SCHEMA Definition)

const JSON_SCHEMA = {
    type: "array",
    items: {
        type: "object",
        properties: {
            title: { type: "string" },
            description: { type: "string" },
            estimatedHours: { type: "number" },
            
            // 💡 FINAL FIX: Use 'additionalProperties' to define a flexible map of skills
            requiredSkills: { 
                type: "object", 
                description: "JSON object mapping skill names (e.g., react) to proficiency levels (e.g., 0.8)",
                additionalProperties: { 
                    type: "number",
                    // Note: You can optionally add "description" here if you wish
                },
            },
        },
        // All top-level fields are required
        required: ["title", "description", "estimatedHours", "requiredSkills"], 
    },
};

// --- 2. GEMINI CLIENT INITIALIZATION ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const geminiClient = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY, 
});


/**
 * Generate a task plan for a project using Google Gemini LLM.
 * @param projectId - The ID of the project.
 * @param userInput - Additional user input to guide the task decomposition.
 * @returns A list of tasks with skill requirements.
 */
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

    // Step 2: Construct the updated prompt
    const prompt = `
      You are a Project Decomposition Assistant. Your job is to analyze the project goal and user-provided team capabilities, and then generate a list of executable tasks.
      Project: "${projectTitle}".
      Goal: "${projectGoal}".
      User Description of Team Capabilities: "${userInput}".

      Instructions:
      - Analyze the team skills described by the user in the 'User Input' section (e.g., 'expert', 'novice', 'worked a lot') and translate those natural language descriptions directly into the required numerical proficiency levels (0.0 to 1.0) for every skill in the final 'requiredSkills' JSON object.
      - Infer the required skills for each task based on the project goal and user input.
      - Generate the list of tasks inside a **JSON markdown block** (i.e., wrapped in \`\`\`json and \`\`\`).
    `;

    // Step 3: Call the Gemini API without strict schema validation
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2, // Keep the temperature low for deterministic results
      },
    });

    // Step 4: Parse and return the response
    const responseText = response.text;

    if (!responseText) {
      console.error('Gemini API returned an empty response for prompt:', prompt);
      throw new Error('Gemini API returned no content.');
    }

    // Strip markdown fences and parse the JSON
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const generatedTasks = JSON.parse(jsonString);

    return generatedTasks;
  } catch (error: any) {
    console.error('Error generating task plan:', error.message || error);
    throw new Error(`Failed to generate task plan: ${error.message || 'Unknown error'}`);
  }
}