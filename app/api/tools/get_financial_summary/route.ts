import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate, groupBy = 'month' } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all financial data for the period
    const [offerings, donations, transactions] = await Promise.all([
      prisma.offering.findMany({
        where: {
          recordedAt: {
            gte: start,
            lte: end
          }
        },
        include: {
          event: {
            select: {
              name: true,
              date: true,
              type: true
            }
          }
        }
      }),
      prisma.donation.findMany({
        where: {
          date: {
            gte: start,
            lte: end
          }
        },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.transaction.findMany({
        where: {
          date: {
            gte: start,
            lte: end
          }
        }
      })
    ]);

    // Calculate totals
    const totalOfferings = offerings.reduce((sum, o) => sum + o.amount, 0);
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalIncome = totalOfferings + totalDonations;

    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const income = transactions.filter(t => t.type === 'INCOME');
    const otherIncome = income.reduce((sum, i) => sum + i.amount, 0);

    const netBalance = totalIncome + otherIncome - totalExpenses;

    // Group offerings by type
    const offeringsByType = offerings.reduce((acc, offering) => {
      const type = offering.offeringType;
      acc[type] = (acc[type] || 0) + offering.amount;
      return acc;
    }, {} as Record<string, number>);

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate averages
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const avgDailyIncome = totalIncome / daysInPeriod;
    const avgDailyExpenses = totalExpenses / daysInPeriod;

    return NextResponse.json({
      success: true,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        days: daysInPeriod
      },
      summary: {
        totalIncome: totalIncome + otherIncome,
        totalOfferings,
        totalDonations,
        otherIncome,
        totalExpenses,
        netBalance,
        avgDailyIncome,
        avgDailyExpenses
      },
      breakdown: {
        offeringsByType,
        expensesByCategory
      },
      details: {
        offeringCount: offerings.length,
        donationCount: donations.length,
        transactionCount: transactions.length,
        expenseCount: expenses.length
      },
      topExpenseCategories: Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount })),
      recentTransactions: transactions
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          date: t.date,
          type: t.type,
          category: t.category,
          amount: t.amount,
          description: t.description
        }))
    });

  } catch (error: any) {
    console.error('Financial summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate financial summary', details: error.message },
      { status: 500 }
    );
  }
}
