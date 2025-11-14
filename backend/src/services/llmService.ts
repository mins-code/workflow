// backend/src/services/llmService.ts

export const llmService = {
  async decomposeProject(title: string, goal: string) {
    // Mock response simulating LLM decomposition
    return [
      {
        title: `Define Requirements for ${title}`,
        description: `Break down the goal "${goal}" into detailed requirements.`,
        estimatedHours: 5,
        requiredSkills: JSON.stringify({ analysis: 0.8, documentation: 0.6 }), // 👈 FIX
      },
      {
        title: `Create Wireframes for ${title}`,
        description: `Design wireframes to visualize the goal "${goal}".`,
        estimatedHours: 8,
        requiredSkills: JSON.stringify({ design: 0.7, ui_ux: 0.9 }), // 👈 FIX
      },
      {
        title: `Develop MVP for ${title}`,
        description: `Build the minimum viable product to achieve the goal "${goal}".`,
        estimatedHours: 20,
        requiredSkills: JSON.stringify({ development: 0.9, testing: 0.5 }), // 👈 FIX
      },
    ];
  },
};

export default llmService;