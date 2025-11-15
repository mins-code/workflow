import { PrismaClient, Task, User } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Calculate the best assignee for a task based on the scoring logic.
 */
export async function findBestAssignee(task: Task, members: User[]): Promise<User | null> {
    let bestUser: User | null = null;
    let highestScore = -Infinity;

    // --- 1. DEFINE MAPPING (CLEANED) ---
    // Maps generic task requirements (e.g., 'design') to specific user skills (e.g., 'react').
    const skillMapping: Record<string, string> = {
        'analysis': 'node', 
        'documentation': 'react', 
        'design': 'react',
        'ui_ux': 'react',
        'development': 'node',
        'testing': 'node',
        // REMOVED: 'react': 'frontend', 'node': 'backend' - they were conflicting.
    };
    
    // Safety: Parse requiredSkills, defaulting to empty object
    const taskSkills = JSON.parse(task.requiredSkills || '{}'); 

    for (const user of members) {
        // Safety: Parse user skills
        const userSkills = JSON.parse(user.skills || '{}'); 

        // --- 2. SKILL MATCH CALCULATION ---
        const skillMatch = Object.keys(taskSkills).reduce((sum, requiredSkillKey) => {
            
            // a. Map the required skill (e.g., 'design') to the user's key ('react' or 'node').
            // If the required skill is in the map, use the mapped key. Otherwise, use the required key itself.
            const userSkillKey = skillMapping[requiredSkillKey] || requiredSkillKey;

            // b. Get the USER's proficiency (e.g., Alice's React skill)
            // Use parseFloat() for safety and default to 0 if key not found or value is NaN.
            const userProficiency = parseFloat(userSkills[userSkillKey]) || 0;
            
            // c. Get the TASK's required value
            const taskRequiredValue = parseFloat(taskSkills[requiredSkillKey]) || 0;

            // d. Accumulate match (User Proficiency * Task Requirement)
            return sum + (userProficiency * taskRequiredValue);
        }, 0);

        // --- 3. SCORING FACTORS ---
        const currentLoad = user.maxHours > 0 ? user.assignedHours / user.maxHours : 1; 
        const remainingHours = user.maxHours - user.assignedHours;
        const availabilityFactor = remainingHours > 0 ? 1 : 0; 

        // Final weighted score (PRD: 0.6 * skill + 0.2 * avail - 0.2 * load)
        const score = (0.6 * skillMatch) + (0.2 * availabilityFactor) - (0.2 * currentLoad);

        // --- 4. DEBUG LOGS ---
        console.log(`[ASSIGNMENT] User: ${user.name}, Score: ${score.toFixed(3)}, SkillMatch: ${skillMatch.toFixed(3)}, Load: ${currentLoad.toFixed(2)}`);

        // --- 5. SELECTION ---
        if (score > highestScore) {
            highestScore = score;
            bestUser = user;
        }
    }

    return bestUser;
}