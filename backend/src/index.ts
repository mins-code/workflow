import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
// Import the routes we created
import projectRoutes from './routes/projectRoutes'; 

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});