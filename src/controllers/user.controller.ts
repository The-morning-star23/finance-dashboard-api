import { Response } from 'express';
import { prisma } from '../utils/db';
import { AuthRequest } from '../middlewares/auth.middleware';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

export const getUsers = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Exclude passwords from the response!
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, status: true, createdAt: true }
    });
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.issues });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return res.status(404).json({ success: false, error: 'User not found' });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, email: true, role: true, status: true }
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};