import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { eventId, memberIds, notes } = await req.json();

    if (!eventId || !memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: 'eventId and memberIds array are required' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Record attendance for all members
    const attendanceRecords = await Promise.all(
      memberIds.map(memberId =>
        prisma.attendance.upsert({
          where: {
            eventId_memberId: {
              eventId,
              memberId
            }
          },
          create: {
            eventId,
            memberId,
            notes
          },
          update: {
            checkInTime: new Date(),
            notes
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Recorded attendance for ${attendanceRecords.length} member(s)`,
      attendanceCount: attendanceRecords.length,
      event: {
        id: event.id,
        name: event.name,
        date: event.date
      }
    });

  } catch (error: any) {
    console.error('Record attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance', details: error.message },
      { status: 500 }
    );
  }
}
