import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service to provide live analytics data for the Analytics dashboard.
 */
export class AnalyticsService {
  /**
   * Get a summary of workload analytics for all teams.
   */
  async getWorkloadSummary() {
    try {
      const totalMembers = await prisma.user.count();
      const totalProjects = await prisma.project.count();

      const users = await prisma.user.findMany({
        select: {
          assignedHours: true,
          maxHours: true,
        },
      });

      const totalAssignedHours = users.reduce((sum, user) => sum + user.assignedHours, 0);
      const totalMaxHours = users.reduce((sum, user) => sum + user.maxHours, 0);
      const avgUtilization = totalMaxHours > 0 ? totalAssignedHours / totalMaxHours : 0;

      return {
        totalMembers,
        totalProjects,
        avgUtilization,
        skillGapAlerts: 3, // Placeholder for skill gap alerts
      };
    } catch (error) {
      console.error('Error fetching workload summary:', error);
      throw new Error('Failed to fetch workload summary.');
    }
  }

  /**
   * Get a summary of workload analytics for a specific team.
   * @param teamId - The ID of the team to filter analytics for.
   */
  async getTeamSummary(teamId: string) {
    try {
      // Fetch total members in the team
      const totalMembers = await prisma.user.count({
        where: { teamId },
      });

      // Fetch total projects assigned to the team
      const totalProjects = await prisma.project.count({
        where: { teamId },
      });

      // Fetch all users in the team to calculate average utilization
      const users = await prisma.user.findMany({
        where: { teamId },
        select: {
          assignedHours: true,
          maxHours: true,
        },
      });

      const totalAssignedHours = users.reduce((sum, user) => sum + user.assignedHours, 0);
      const totalMaxHours = users.reduce((sum, user) => sum + user.maxHours, 0);
      const avgUtilization = totalMaxHours > 0 ? totalAssignedHours / totalMaxHours : 0;

      return {
        totalMembers,
        totalProjects,
        avgUtilization,
        skillGapAlerts: 3, // Placeholder for skill gap alerts
      };
    } catch (error) {
      console.error(`Error fetching team summary for teamId ${teamId}:`, error);
      throw new Error('Failed to fetch team summary.');
    }
  }
}

export default new AnalyticsService();