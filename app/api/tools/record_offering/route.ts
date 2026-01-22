import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { eventId, offeringType, amount, currency = 'USD', notes } = await req.json();

    if (!eventId || !offeringType || !amount) {
      return NextResponse.json(
        { error: 'eventId, offeringType, and amount are required' },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Create offering record
    const offering = await prisma.offering.create({
      data: {
        eventId,
        offeringType,
        amount: parseFloat(amount),
        currency,
        notes
      }
    });

    return NextResponse.json({
      success: true,
      message: `Recorded ${offeringType.toLowerCase().replace('_', ' ')} of ${currency} ${amount.toLocaleString()}`,
      offering: {
        id: offering.id,
        type: offering.offeringType,
        amount: offering.amount,
        currency: offering.currency,
        recordedAt: offering.recordedAt
      },
      event: {
        name: event.name,
        date: event.date
      }
    });

  } catch (error: any) {
    console.error('Record offering error:', error);
    return NextResponse.json(
      { error: 'Failed to record offering', details: error.message },
      { status: 500 }
    );
  }
}
