import { Request, Response } from 'express';
import { prisma } from '../utils/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Define strict validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("Incoming Request Body:", req.body); // <-- Let's see what Express is receiving

    // 1. Validate Input
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.issues });
    }

    const { email, password, role } = parsed.data;

    // 2. Check Database
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'VIEWER'
      }
    });

    res.status(201).json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error("REGISTER CRASH:", error); // <-- This will print the exact stack trace to your terminal!
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Validate Input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.issues });
    }

    const { email, password } = parsed.data;

    // 2. Authenticate
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status === 'INACTIVE') {
      return res.status(400).json({ success: false, error: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // 3. Generate Token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1d' });

    res.status(200).json({ success: true, token, data: { id: user.id, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error("LOGIN CRASH:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};