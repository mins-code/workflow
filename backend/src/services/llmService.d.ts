declare const llmService: {
  decomposeProject(title: string, goal: string): Promise<{
    title: string;
    description: string;
    estimatedHours: number;
    requiredSkills: Record<string, number>;
  }[]>;
};

export default llmService;