import { Response } from 'express';
import { prisma } from '../utils/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // 1. Calculate Total Income
    const incomeAggregate = await prisma.record.aggregate({
      _sum: { amount: true },
      where: { type: 'INCOME' }
    });
    const totalIncome = incomeAggregate._sum.amount || 0;

    // 2. Calculate Total Expenses
    const expenseAggregate = await prisma.record.aggregate({
      _sum: { amount: true },
      where: { type: 'EXPENSE' }
    });
    const totalExpense = expenseAggregate._sum.amount || 0;

    // 3. Calculate Net Balance
    const netBalance = totalIncome - totalExpense;

    // 4. Calculate Category-wise Totals
    const categoryWise = await prisma.record.groupBy({
      by: ['category', 'type'],
      _sum: { amount: true }
    });
    
    const categoryTotals = categoryWise.map(item => ({
      category: item.category,
      type: item.type,
      total: item._sum.amount || 0
    }));

    // 5. Fetch Recent Activity (Last 5 records)
    const recentActivity = await prisma.record.findMany({
      orderBy: { date: 'desc' },
      take: 5
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalIncome,
          totalExpense,
          netBalance
        },
        categoryTotals,
        recentActivity
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};