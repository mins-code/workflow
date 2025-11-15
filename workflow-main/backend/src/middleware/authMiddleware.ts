import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * JWT Authentication Middleware
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    // Verify the token using the JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    // Attach the decoded user payload to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

export default authMiddleware;