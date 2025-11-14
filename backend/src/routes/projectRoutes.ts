import express from 'express';
import { PrismaClient } from '@prisma/client';
import { findBestAssignee } from '../services/assignmentService'; 
// Removed unused import: import axios from 'axios';

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

// --- GET Routes ---

/**
 * GET /: List all projects (Used for Project List View)
 */
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: { tasks: true }, 
        });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

/**
 * GET /:projectId: Fetch a single project by ID
 */
router.get('/:projectId', async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            // Ensure you include tasks for the Kanban board view
            include: { team: true, tasks: true }, 
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error(`Error fetching project with ID ${projectId}:`, error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

/**
 * GET /:projectId/tasks: Fetch all tasks for a specific project
 */
router.get('/:projectId/tasks', async (req, res) => {
    const { projectId } = req.params;

    try {
        const tasks = await prisma.task.findMany({
            where: { projectId },
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error(`Error fetching tasks for project with ID ${projectId}:`, error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// --- PUT/POST Routes ---

/**
 * PUT /tasks/:taskId: Update a task's status and/or assignee (Used for Kanban drag-and-drop)
 * NOTE: This is mounted at /api/projects/tasks/:taskId
 */
router.put('/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params; 
    const updateData = req.body; // Full body { status: 'DONE', assigneeId: '...' }

    try {
        // Find the original task to ensure it exists
        const originalTask = await prisma.task.findUnique({ where: { id: taskId } });
        if (!originalTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Update the task in the database with the provided fields
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData, // Prisma handles the update for any field in updateData
        });

        // Respond with the updated task
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(`Error updating task with ID ${taskId}:`, error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});


/**
 * POST /:projectId/auto-assign: Auto-assign tasks to team members
 */
router.post('/:projectId/auto-assign', async (req, res) => {
    const { projectId } = req.params;

    try {
        // Fetch all unassigned tasks for the project
        const tasks = await prisma.task.findMany({
            where: { projectId, assigneeId: null },
        });

        // Fetch all team members
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { team: { include: { members: true } } },
        });

        if (!project || !project.team) {
            return res.status(404).json({ error: 'Project or team not found' });
        }

        const members = project.team.members;
        const assignments = [];

        for (const task of tasks) {
            // Note: findBestAssignee logic must be imported correctly
            const bestAssignee = await findBestAssignee(task, members); 

            if (bestAssignee) {
                // Update the task with the new assignee
                const updatedTask = await prisma.task.update({
                    where: { id: task.id },
                    data: { assigneeId: bestAssignee.id },
                });

                assignments.push({
                    taskId: updatedTask.id,
                    taskTitle: updatedTask.title,
                    assigneeId: bestAssignee.id,
                    assigneeName: bestAssignee.name,
                });
            }
        }

        res.status(200).json(assignments);
    } catch (error) {
        console.error('Error auto-assigning tasks:', error);
        res.status(500).json({ error: 'Failed to auto-assign tasks' });
    }
});


// REMOVED: PUT /tasks/:taskId/external route (The confusing recursive one)


export default router;