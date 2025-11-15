import express from 'express';
import { PrismaClient } from '@prisma/client';
import { findBestAssignee } from '../services/assignmentService';

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
      include: { tasks: true, team: true }, // Include the team relationship
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /:projectId: Fetch a single project by ID
 * Includes the full team object and all associated members.
 */
router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            members: true, // Include all members of the team
          },
        },
        tasks: true, // Include tasks for the project
      },
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
 * Includes the full assignee object for each task.
 */
router.get('/:projectId/tasks', async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: true, // Include the full assignee object
      },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for project with ID ${projectId}:`, error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// --- PUT/POST Routes ---

/**
 * PUT /:projectId: Update a project's details (e.g., teamId, status, deadline)
 */
router.put('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body; // Extract fields to update from the request body

  try {
    // Update the project in the database
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData, // Apply the updates from the request body
    });

    // Respond with the updated project
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(`Error updating project with ID ${projectId}:`, error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/**
 * PUT /tasks/:taskId: Update a task's status and/or assignee
 */
router.put('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const updateData = req.body;

  try {
    const originalTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!originalTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

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
    const tasks = await prisma.task.findMany({
      where: { projectId, assigneeId: null },
    });

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

/**
 * POST /: Create a new project without assigning a team by default.
 */
router.post('/', async (req, res) => {
  const { title, goal, deadline } = req.body;

  // Validate required fields
  if (!title || !goal || !deadline) {
    return res.status(400).json({ error: 'Title, goal, and deadline are required.' });
  }

  try {
    // Create the project with no team assigned
    const project = await prisma.project.create({
      data: {
        title,
        goal,
        deadline: new Date(deadline), // Ensure the deadline is a proper Date object
        teamId: null, // Explicitly set teamId to null to ensure the project is unassigned
      },
    });

    res.status(201).json(project); // Return the created project
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * DELETE /:projectId: Delete a project by ID
 */
router.delete('/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    // Call the service function to delete the project
    const deletedProject = await prisma.project.delete({
      where: { id: projectId },
    });

    // Respond with the deleted project object
    res.status(200).json(deletedProject);
  } catch (error) {
    // Safe type assertion for the error object
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code: string }; // Explicitly cast to an object with a 'code' property

      // Handle Prisma's "record not found" error
      if (prismaError.code === 'P2025') {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    // Fallback for all other errors
    console.error(`Error deleting project with ID ${projectId}:`, error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

/**
 * POST /tasks/bulk: Bulk insert AI-generated tasks into the database.
 */
router.post('/tasks/bulk', async (req, res) => {
  const { tasks } = req.body;

  // Validate the request body
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'Invalid request: tasks must be a non-empty array.' });
  }

  try {
    // Prepare the tasks for insertion
    const formattedTasks = tasks.map((task) => ({
      title: task.title,
      description: task.description,
      estimatedHours: task.estimatedHours,
      requiredSkills: JSON.stringify(task.requiredSkills), // Serialize requiredSkills
      status: task.status || 'TODO', // Default status to 'TODO' if not provided
      projectId: task.projectId, // Ensure projectId is included in each task
      assigneeId: task.assigneeId || null, // Optional assigneeId
    }));

    // Insert tasks into the database using createMany
    const result = await prisma.task.createMany({
      data: formattedTasks,
    });

    // Return a success message
    res.status(201).json({
      message: 'Tasks inserted successfully.',
      count: result.count, // Number of tasks inserted
    });
  } catch (error) {
    console.error('Error inserting tasks:', error);
    res.status(500).json({ error: 'Failed to insert tasks.' });
  }
});

export default router;