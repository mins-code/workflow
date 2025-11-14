import express from 'express';
import { PrismaClient } from '@prisma/client';
import { findBestAssignee } from '../services/assignmentService';

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

// GET /: List all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { tasks: true }, // Include tasks for each project
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /: Create a new project linked to a team
router.post('/', async (req, res) => {
  const { title, goal, deadline } = req.body;

  try {
    // Fetch the first team from the database
    const team = await prisma.team.findFirst();

    if (!team) {
      return res.status(400).json({ error: 'No team found. Please create a team first.' });
    }

    // Create the project with the fetched team ID
    const project = await prisma.project.create({
      data: {
        title,
        goal,
        deadline: new Date(deadline), // Ensure the deadline is a proper Date object
        teamId: team.id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// POST /:projectId/auto-assign: Auto-assign tasks to team members
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

export default router;