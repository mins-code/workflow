// backend/src/index.ts (Add these lines to the very top)
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
// Import Auth Middleware
import authMiddleware from './middleware/authMiddleware'; 

// Import the routes we created
import projectRoutes from './routes/projectRoutes'; 
import authRoutes from './routes/authRoutes'; 
import teamRoutes from './routes/teamRoutes'; 
import memberRoutes from './routes/memberRoutes'; 
import geminiRoutes from './routes/geminiRoutes'; 
import analyticsRoutes from './routes/analyticsRoutes'; // Import the analytics routes

const app = express();
const prisma = new PrismaClient();

// Global Middleware
app.use(cors());
app.use(express.json());

// --- Public Routes (Unsecured) ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running!' });
});

// Authentication Routes (Login/Signup must be public)
app.use('/api/auth', authRoutes); 

// --- Protected Routes (Secured by JWT Middleware) ---

// Connect the Project Routes
app.use('/api/projects', authMiddleware, projectRoutes); // 🔒 Secured
// Connect the Team Routes
app.use('/api/teams', authMiddleware, teamRoutes); // 🔒 Secured
// Connect the Member Routes
app.use('/api/members', authMiddleware, memberRoutes); // 🔒 Secured
// Connect the Gemini Routes
app.use('/api/gemini', authMiddleware, geminiRoutes); // 🔒 Secured
// Add the analytics routes
app.use('/api/analytics', authMiddleware, analyticsRoutes); // 🔒 Secured by JWT middleware

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});