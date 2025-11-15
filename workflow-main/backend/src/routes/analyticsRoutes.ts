import express from 'express';
import analyticsService from '../services/analyticsService';

const router = express.Router();

/**
 * GET /summary: Fetch the workload summary analytics for all teams.
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = await analyticsService.getWorkloadSummary();
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching workload summary:', error);
    res.status(500).json({ error: 'Failed to fetch workload summary.' });
  }
});

/**
 * GET /teams/:teamId/summary: Fetch the workload summary analytics for a specific team.
 */
router.get('/teams/:teamId/summary', async (req, res) => {
  const { teamId } = req.params;

  try {
    const teamSummary = await analyticsService.getTeamSummary(teamId);
    res.status(200).json(teamSummary);
  } catch (error) {
    console.error(`Error fetching team summary for teamId ${teamId}:`, error);
    res.status(500).json({ error: 'Failed to fetch team summary.' });
  }
});

export default router;