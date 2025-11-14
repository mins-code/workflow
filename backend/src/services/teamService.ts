import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TeamService {
  /**
   * Create a new team.
   * @param name - The name of the team.
   * @param description - A brief description of the team.
   */
  async createTeam(name: string, description: string) {
    try {
      const team = await prisma.team.create({
        data: {
          name,
          description,
        },
      });
      return team;
    } catch (error) {
      console.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
  }

  /**
   * Fetch all teams, including their associated members.
   */
  async getAllTeams() {
    try {
      const teams = await prisma.team.findMany({
        include: {
          members: true, // Include the list of all associated members
        },
      });
      return teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw new Error('Failed to fetch teams');
    }
  }

  /**
   * Update a team's details.
   * @param id - The ID of the team to update.
   * @param name - The new name of the team.
   * @param description - The new description of the team.
   */
  async updateTeam(id: string, name: string, description: string) {
    try {
      const updatedTeam = await prisma.team.update({
        where: { id },
        data: {
          name,
          description,
        },
      });
      return updatedTeam;
    } catch (error) {
      console.error(`Error updating team with ID ${id}:`, error);
      throw new Error('Failed to update team');
    }
  }

  /**
   * Delete a team by ID.
   * @param id - The ID of the team to delete.
   */
  async deleteTeam(id: string) {
    try {
      const deletedTeam = await prisma.team.delete({
        where: { id },
      });
      return deletedTeam;
    } catch (error) {
      console.error(`Error deleting team with ID ${id}:`, error);
      throw new Error('Failed to delete team');
    }
  }
}

export default new TeamService();
