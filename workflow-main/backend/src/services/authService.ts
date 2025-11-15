import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Signup a new user.
   */
  async signup(email: string, password: string, name: string, role: string = 'Team Member') {
    // Step 1: Check if the user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    // Step 2: Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Step 3: Create the new user in the database
    const newUser = await this.prisma.user.create({
      data: {
        email,
        name,
        role,
        password: hashedPassword,
        
        // Supply required fields for schema
        skills: JSON.stringify({}), 
        availability: parseFloat("40.0"), 
        maxHours: parseFloat("40.0"), 
      },
    });

    // Step 4: Return the new user object (excluding the password hash)
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}

  /**
   * Login an existing user.
   */
  async login(email: string, password: string): Promise<string> { // 💡 FIX 1: Explicitly define return type as string
    // Step 1: Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { // 💡 FIX 2: Explicitly select the password field for access
        id: true,
        email: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Step 2: Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Step 3: Generate a JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Step 4: Return the JWT token
    return token; // 💡 FIX 3: Return the token string directly, not { token }
  }
}

export default new AuthService();