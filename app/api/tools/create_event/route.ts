import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { name, type, date, startTime, endTime, location, description } = await req.json();

    if (!name || !type || !date) {
      return NextResponse.json(
        { error: 'name, type, and date are required' },
        { status: 400 }
      );
    }

    // Hardcoded createdById for demo (should come from session in production)
    const createdById = 'system';

    const event = await prisma.event.create({
      data: {
        name,
        type,
        date: new Date(date),
        startTime,
        endTime,
        location,
        description,
        createdById
      }
    });

    return NextResponse.json({
      success: true,
      message: `Event "${name}" created successfully`,
      event: {
        id: event.id,
        name: event.name,
        type: event.type,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        description: event.description
      }
    });

  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    );
  }
}
