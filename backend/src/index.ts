import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
// Import the routes we created
import projectRoutes from './routes/projectRoutes'; 
import authRoutes from './routes/authRoutes'; // Import the auth routes
import teamRoutes from './routes/teamRoutes'; // Import the team routes
import memberRoutes from './routes/memberRoutes'; // Import the member routes

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

// Connect the Project Routes
app.use('/api/projects', projectRoutes);
// Connect the Auth Routes
app.use('/api/auth', authRoutes); // Use the auth routes at /api/auth
// Connect the Team Routes
app.use('/api/teams', teamRoutes);
// Connect the Member Routes
app.use('/api/members', memberRoutes); // Connect the member routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});