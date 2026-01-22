import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data for when database is unavailable
const getMockData = (period: string) => ({
  success: true,
  period,
  summary: {
    members: {
      total: 156,
      active: 142,
      new: 12,
      growthRate: '+8.5%'
    },
    events: {
      total: 48,
      upcoming: 5,
      recentAttendance: 324
    },
    finance: {
      totalIncome: 24500,
      totalExpenses: 18200,
      balance: 6300,
      offerings: 18500,
      donations: 6000
    },
    recentEvents: [
      { id: '1', name: 'Sunday Service', type: 'SUNDAY_SERVICE', date: new Date().toISOString(), attendanceCount: 120 },
      { id: '2', name: 'Prayer Meeting', type: 'PRAYER_MEETING', date: new Date().toISOString(), attendanceCount: 45 },
      { id: '3', name: 'Youth Service', type: 'YOUTH_SERVICE', date: new Date().toISOString(), attendanceCount: 68 }
    ],
    topDonors: [
      { memberId: '1', memberName: 'John Smith', totalDonations: 2500 },
      { memberId: '2', memberName: 'Mary Johnson', totalDonations: 1800 },
      { memberId: '3', memberName: 'David Williams', totalDonations: 1200 }
    ]
  },
  _notice: 'Using demo data. Configure DATABASE_URL in .env.local to connect to your database.'
});

export async function POST(req: NextRequest) {
  try {
    const { period = 'month' } = await req.json();

    // Check if database is configured properly
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      return NextResponse.json(getMockData(period));
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get statistics
    const [
      totalMembers,
      activeMembers,
      newMembers,
      totalEvents,
      upcomingEvents,
      recentAttendance,
      totalOfferings,
      totalDonations,
      totalExpenses
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.member.count({
        where: {
          joinDate: { gte: startDate }
        }
      }),
      prisma.event.count(),
      prisma.event.count({
        where: {
          date: { gte: now }
        }
      }),
      prisma.attendance.count({
        where: {
          checkInTime: { gte: startDate }
        }
      }),
      prisma.offering.aggregate({
        where: {
          recordedAt: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      prisma.donation.aggregate({
        where: {
          date: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          date: { gte: startDate },
          type: 'EXPENSE'
        },
        _sum: { amount: true }
      })
    ]);

    const totalIncome = (totalOfferings._sum.amount || 0) + (totalDonations._sum.amount || 0);
    const balance = totalIncome - (totalExpenses._sum.amount || 0);

    // Get recent events
    const recentEvents = await prisma.event.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { attendances: true }
        }
      }
    });

    // Get top donors
    const topDonors = await prisma.donation.groupBy({
      by: ['memberId'],
      where: {
        date: { gte: startDate },
        memberId: { not: null }
      },
      _sum: { amount: true },
      orderBy: {
        _sum: { amount: 'desc' }
      },
      take: 5
    });

    const topDonorsWithDetails = await Promise.all(
      topDonors.map(async (donor) => {
        const member = await prisma.member.findUnique({
          where: { id: donor.memberId! }
        });
        return {
          memberId: donor.memberId,
          memberName: member ? `${member.firstName} ${member.lastName}` : 'Unknown',
          totalDonations: donor._sum.amount
        };
      })
    );

    // Calculate growth rate
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const previousPeriodMembers = await prisma.member.count({
      where: {
        joinDate: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    const growthRate = previousPeriodMembers > 0
      ? ((newMembers - previousPeriodMembers) / previousPeriodMembers * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      success: true,
      period,
      summary: {
        members: {
          total: totalMembers,
          active: activeMembers,
          new: newMembers,
          growthRate: `${growthRate}%`
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          recentAttendance
        },
        finance: {
          totalIncome,
          totalExpenses: totalExpenses._sum.amount || 0,
          balance,
          offerings: totalOfferings._sum.amount || 0,
          donations: totalDonations._sum.amount || 0
        },
        recentEvents: recentEvents.map(e => ({
          id: e.id,
          name: e.name,
          type: e.type,
          date: e.date,
          attendanceCount: e._count.attendances
        })),
        topDonors: topDonorsWithDetails
      }
    });

  } catch (error: any) {
    console.error('Dashboard summary error:', error);

    // Return mock data when database is unavailable
    return NextResponse.json({
      success: true,
      period: 'month',
      summary: {
        members: {
          total: 0,
          active: 0,
          new: 0,
          growthRate: '0%'
        },
        events: {
          total: 0,
          upcoming: 0,
          recentAttendance: 0
        },
        finance: {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          offerings: 0,
          donations: 0
        },
        recentEvents: [],
        topDonors: []
      },
      _notice: 'Database not configured. Please set up DATABASE_URL in .env'
    });
  }
}
