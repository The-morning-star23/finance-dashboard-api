import { Response } from 'express';
import { prisma } from '../utils/db';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';

// Validation Schemas
const recordSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(), 
  notes: z.string().optional()
});

const querySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional()
});

export const createRecord = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const parsed = recordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.issues });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const record = await prisma.record.create({
      data: {
        ...parsed.data,
        userId
      }
    });

    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRecords = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const parsedQuery = querySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, error: 'Invalid query parameters' });
    }

    const { type, category, startDate, endDate } = parsedQuery.data;

    const whereClause: any = {};
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const records = await prisma.record.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateRecord = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string; // Explicitly cast as string
    const parsed = recordSchema.partial().safeParse(req.body); 
    
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.issues });
    }

    const existing = await prisma.record.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Record not found' });

    const updatedRecord = await prisma.record.update({
      where: { id },
      data: parsed.data
    });

    res.status(200).json({ success: true, data: updatedRecord });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteRecord = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string; // Explicitly cast as string
    
    const existing = await prisma.record.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Record not found' });

    await prisma.record.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};