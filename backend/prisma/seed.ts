import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Step 1: Clean the database
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.team.deleteMany({});

  // Step 2: Create a Team
  const team = await prisma.team.create({
    data: {
      name: 'Engineering Alpha',
      description: 'The core engineering team for the MVP.',
    },
  });

  // Step 3: Create Users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      role: 'Senior Dev',
      skills: JSON.stringify({ frontend: 0.9, backend: 0.4 }), // Updated skill names
      availability: 1.0,
      maxHours: 40,
      assignedHours: 0,
      teamId: team.id,
      password: 'hashed_password_here', // Add hashed password
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      role: 'Backend Lead',
      skills: JSON.stringify({ frontend: 0.3, backend: 0.9 }), // Updated skill names
      availability: 1.0,
      maxHours: 40,
      assignedHours: 0,
      teamId: team.id,
      password: 'hashed_password_here', // Add hashed password
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: 'Charlie',
      email: 'charlie@example.com',
      role: 'Junior Dev',
      skills: JSON.stringify({ frontend: 0.5, backend: 0.5 }), // Updated skill names
      availability: 1.0,
      maxHours: 20,
      assignedHours: 0,
      teamId: team.id,
      password: 'hashed_password_here', // Add hashed password
    },
  });

  // Step 4: Create a Project
  const project = await prisma.project.create({
    data: {
      title: 'MVP Dashboard',
      goal: 'Build the minimum viable product for the dashboard.',
      deadline: new Date('2025-12-31'),
      teamId: team.id,
    },
  });

  // Step 5: Create Tasks
  const tasks = [
    {
      title: 'Setup React App',
      description: 'Initialize the React application with Vite.',
      estimatedHours: 8,
      requiredSkills: JSON.stringify({ react: 0.8 }),
      projectId: project.id,
    },
    {
      title: 'Build API',
      description: 'Develop the backend API using Express.',
      estimatedHours: 12,
      requiredSkills: JSON.stringify({ node: 0.8 }),
      projectId: project.id,
    },
    {
      title: 'Write Documentation',
      description: 'Document the project setup and usage.',
      estimatedHours: 4,
      requiredSkills: JSON.stringify({}),
      projectId: project.id,
    },
    {
      title: 'Fix CSS Bugs',
      description: 'Resolve styling issues in the frontend.',
      estimatedHours: 6,
      requiredSkills: JSON.stringify({ react: 0.5 }),
      projectId: project.id,
    },
    {
      title: 'Database Migration',
      description: 'Perform database schema migration.',
      estimatedHours: 10,
      requiredSkills: JSON.stringify({ node: 0.9 }),
      projectId: project.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });