import express from 'express';
// 💡 FIX 1: Import the service as a default export, matching the file export.
import authService from '../services/authService'; 
import { Request, Response } from 'express'; // Import types for clarity

const router = express.Router();

// 💡 FIX 2: Middleware to parse JSON bodies
router.use(express.json());

// POST /signup: Register a new user
router.post('/signup', async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    // Optional: Basic validation check (can be expanded)
    if (!email || !password || !name) {
        console.error('Validation Error: Missing required fields');
        return res.status(400).json({ error: 'Missing required fields (email, password, name).' });
    }

    try {
        // Use the imported instance
        const user = await authService.signup(email, password, name, role); 
        res.status(201).json(user); 
    } catch (error: any) {
        console.error('Error during signup:', error.message, { email, name, role });
        
        // Handle specific user-level errors (e.g., duplicate email from service)
        if (error.message.includes('already exists')) {
            return res.status(400).json({ error: error.message }); // 400 Bad Request
        }
        return res.status(500).json({ error: 'Internal Server Error' }); // Catch-all 500
    }
});

// POST /login: Authenticate a user and return a JWT
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.error('Validation Error: Missing required fields');
        return res.status(400).json({ error: 'Missing required fields (email, password).' });
    }

    try {
        // 💡 FIX 3: AuthService.login returns the token string directly.
        const token = await authService.login(email, password); 
        
        // Return the JWT token inside a token object
        res.status(200).json({ token }); 
    } catch (error: any) {
        console.error('Error during login:', error.message, { email });

        // Handle invalid credentials error
        if (error.message.includes('Invalid credentials')) {
            return res.status(401).json({ error: error.message }); // 401 Unauthorized
        }
        return res.status(500).json({ error: 'Internal Server Error' }); // Catch-all 500
    }
});

export default router;