import express from 'express';
import memberService from '../services/memberService';

const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

/**
 * GET /: Fetch all members.
 */
router.get('/', async (req, res) => {
  try {
    const members = await memberService.getAllMembers();
    res.status(200).json(members);
  } catch (error: any) {
    console.error('Error fetching members:', error.message);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

/**
 * POST /onboard: Onboard a new team member.
 */
router.post('/onboard', async (req, res) => {
  try {
    const newMember = await memberService.onboardMember(req.body);
    res.status(201).json(newMember);
  } catch (error: any) {
    console.error('Error onboarding new member:', error.message);
    if (error.message.includes('already exists')) {
      res.status(400).json({ error: error.message }); // Bad Request for duplicate email
    } else {
      res.status(500).json({ error: 'Failed to onboard new member' });
    }
  }
});

/**
 * PUT /:id: Update a member's fields (e.g., teamId).
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedMember = await memberService.updateMember(id, updateData);
    res.status(200).json(updatedMember);
  } catch (error: any) {
    console.error(`Error updating member with ID ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

/**
 * DELETE /:id: Delete a member by ID.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMember = await memberService.deleteMember(id);
    res.status(200).json(deletedMember);
  } catch (error: any) {
    console.error(`Error deleting member with ID ${id}:`, error.message);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

export default router;