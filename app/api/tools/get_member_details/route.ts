import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        attendances: {
          take: 10,
          orderBy: { checkInTime: 'desc' },
          include: { event: true }
        },
        donations: {
          take: 10,
          orderBy: { date: 'desc' }
        },
        departmentMembers: {
          include: { department: true }
        }
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Calculate giving summary
    const totalDonations = member.donations.reduce((sum, d) => sum + d.amount, 0);
    const attendanceCount = await prisma.attendance.count({
      where: { memberId }
    });

    return NextResponse.json({
      success: true,
      member: {
        ...member,
        statistics: {
          totalDonations,
          attendanceCount,
          departmentCount: member.departmentMembers.length
        }
      }
    });

  } catch (error: any) {
    console.error('Get member details error:', error);
    return NextResponse.json(
      { error: 'Failed to get member details', details: error.message },
      { status: 500 }
    );
  }
}
