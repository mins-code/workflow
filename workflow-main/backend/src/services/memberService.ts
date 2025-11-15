import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class MemberService {

    /**
     * Fetch all members, including their assigned project count and team details.
     */
    async getAllMembers() {
        try {
            const members = await prisma.user.findMany({
                include: {
                    tasks: true, // For load calculation
                    team: true,  // For display in the team view
                },
            });

            // Map members to include their project/task load
            return members.map((member) => ({
                ...member,
                projectCount: member.tasks.length, // Calculate the number of tasks assigned
            }));
        } catch (error) {
            console.error('Error fetching all members:', error);
            throw new Error('Failed to fetch members');
        }
    }

    /**
     * Onboard a new team member (Find-or-Create logic).
     */
    async onboardMember(memberData: {
        name: string;
        email: string;
        role: string;
        skills: object;
        availability: number;
        maxHours: number;
    }) {
        const { name, email, role, skills, availability, maxHours } = memberData;

        try {
            // Step 1: Check if a user with the given email already exists
            const existingUser = await prisma.user.findUnique({ where: { email } });

            if (existingUser) {
                // If the user already exists, return the existing user object (Find-or-Create)
                return existingUser;
            }

            // Step 2: Generate and Hash a default password
            const defaultPassword = 'Welcome123!';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            // Step 3: Create the new user
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    role,
                    skills: JSON.stringify(skills), 
                    
                    // Explicitly ensure values are numbers before saving to Float fields
                    availability: parseFloat(String(availability)), 
                    maxHours: parseFloat(String(maxHours)),
                    
                    assignedHours: 0, 
                    password: hashedPassword, 
                },
            });

            return newUser;
        } catch (error) {
            console.error('Error onboarding new member:', error);
            throw new Error('Failed to onboard new member');
        }
    }

    /**
     * Update a member's fields (Generic PUT /api/members/:id).
     * @param id - The ID of the member to update.
     * @param data - The fields to update (e.g., teamId, maxHours, role).
     */
    async updateMember(id: string, data: any) {
        try {
            const updatePayload: any = { ...data };

            // 🔑 CRITICAL FIX: Ensure required numeric fields are converted from string/number input
            if (updatePayload.maxHours !== undefined) {
                updatePayload.maxHours = parseFloat(updatePayload.maxHours);
            }
            if (updatePayload.availability !== undefined) {
                updatePayload.availability = parseFloat(updatePayload.availability);
            }
            
            // Serialize skills if they are being updated as an object
            if (updatePayload.skills && typeof updatePayload.skills !== 'string') {
                updatePayload.skills = JSON.stringify(updatePayload.skills);
            }

            const updatedMember = await prisma.user.update({
                where: { id },
                data: updatePayload,
            });
            return updatedMember;
        } catch (error) {
            console.error(`Error updating member with ID ${id}:`, error);
            throw new Error('Failed to update member');
        }
    }

    /**
     * Fetch a single member by ID.
     */
    async getMemberById(id: string) {
        try {
            const member = await prisma.user.findUnique({ where: { id } });
            if (!member) {
                throw new Error(`Member with ID ${id} not found`);
            }
            return member;
        } catch (error) {
            console.error(`Error fetching member with ID ${id}:`, error);
            throw new Error('Failed to fetch member');
        }
    }

    /**
     * Delete a member by ID.
     */
    async deleteMember(id: string) {
        try {
            const deletedMember = await prisma.user.delete({ where: { id } });
            return deletedMember;
        } catch (error) {
            console.error(`Error deleting member with ID ${id}:`, error);
            throw new Error('Failed to delete member');
        }
    }

    /**
     * Find a user by their name.
     * @param name - The name of the user to find.
     */
    async findUserByName(name: string) {
        try {
            const user = await prisma.user.findFirst({
                where: { name },
            });
            return user;
        } catch (error) {
            console.error(`Error finding user by name "${name}":`, error);
            throw new Error('Failed to find user by name');
        }
    }
}

export default new MemberService();