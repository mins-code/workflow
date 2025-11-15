import express from 'express';
import teamService from '../services/teamService';

const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

/**
 * GET /: Fetch all teams, including their associated members.
 */
router.get('/', async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    res.status(200).json(teams); // Return the list of teams
  } catch (error: any) {
    console.error('Error fetching teams:', error.message);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

/**
 * POST /: Create a new team.
 */
router.post('/', async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  try {
    const team = await teamService.createTeam(name, description);
    res.status(201).json(team); // Return the created team
  } catch (error: any) {
    console.error('Error creating team:', error.message);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

/**
 * PUT /:id: Update a team's details.
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  try {
    const updatedTeam = await teamService.updateTeam(id, name, description);
    res.status(200).json(updatedTeam); // Return the updated team
  } catch (error: any) {
    console.error(`Error updating team with ID ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

/**
 * DELETE /:id: Delete a team by ID.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTeam = await teamService.deleteTeam(id);
    res.status(200).json(deletedTeam); // Return the deleted team object
  } catch (error: any) {
    console.error(`Error deleting team with ID ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;