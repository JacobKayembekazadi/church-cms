import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, dateOfBirth, gender, address, city, state, zipCode, membershipType, emergencyContact, emergencyPhone, notes } = data;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'firstName and lastName are required' },
        { status: 400 }
      );
    }

    // Get createdById from session (hardcoded for demo)
    const createdById = data.createdById || 'system';

    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        city,
        state,
        zipCode,
        membershipType: membershipType || 'REGULAR',
        emergencyContact,
        emergencyPhone,
        notes,
        createdById
      }
    });

    return NextResponse.json({
      success: true,
      message: `Member ${firstName} ${lastName} created successfully`,
      member
    });

  } catch (error: any) {
    console.error('Create member error:', error);
    return NextResponse.json(
      { error: 'Failed to create member', details: error.message },
      { status: 500 }
    );
  }
}
