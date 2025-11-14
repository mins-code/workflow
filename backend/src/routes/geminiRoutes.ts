import express from 'express';
import { generateTaskPlan } from '../services/geminiService';
import authMiddleware from '../middleware/authMiddleware'; // Import the middleware

const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

/**
 * POST /plan: Generate a task plan for a project using Google Gemini LLM.
 * This route is protected by the authMiddleware.
 */
router.post('/plan', authMiddleware, async (req, res) => {
  const { projectId, userInput } = req.body;

  // Validate request body
  if (!projectId || !userInput) {
    return res.status(400).json({ error: 'Missing required fields: projectId and userInput.' });
  }

  try {
    // Call the Gemini service to generate the task plan
    const taskPlan = await generateTaskPlan(projectId, userInput);

    // Return the generated task plan
    res.status(200).json(taskPlan);
  } catch (error: any) {
    console.error('Error generating task plan:', error.message);
    res.status(500).json({ error: 'Failed to generate task plan.' });
  }
});

export default router;