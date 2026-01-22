// Member Management Tools
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data for demo mode
const mockMembers = [
  { id: '1', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '555-0101', membershipType: 'REGULAR', status: 'ACTIVE', joinDate: '2024-01-15', photo: null },
  { id: '2', firstName: 'Mary', lastName: 'Johnson', email: 'mary.j@email.com', phone: '555-0102', membershipType: 'BAPTIZED', status: 'ACTIVE', joinDate: '2023-06-20', photo: null },
  { id: '3', firstName: 'David', lastName: 'Williams', email: 'david.w@email.com', phone: '555-0103', membershipType: 'LEADERSHIP', status: 'ACTIVE', joinDate: '2022-03-10', photo: null },
  { id: '4', firstName: 'Sarah', lastName: 'Brown', email: 'sarah.b@email.com', phone: '555-0104', membershipType: 'PARTNER', status: 'ACTIVE', joinDate: '2023-09-05', photo: null },
  { id: '5', firstName: 'Michael', lastName: 'Davis', email: 'michael.d@email.com', phone: '555-0105', membershipType: 'REGULAR', status: 'ACTIVE', joinDate: '2024-02-28', photo: null },
  { id: '6', firstName: 'Emily', lastName: 'Wilson', email: 'emily.w@email.com', phone: '555-0106', membershipType: 'VISITOR', status: 'ACTIVE', joinDate: '2024-03-01', photo: null },
  { id: '7', firstName: 'James', lastName: 'Taylor', email: 'james.t@email.com', phone: '555-0107', membershipType: 'BAPTIZED', status: 'INACTIVE', joinDate: '2021-11-15', photo: null },
  { id: '8', firstName: 'Jennifer', lastName: 'Anderson', email: 'jennifer.a@email.com', phone: '555-0108', membershipType: 'REGULAR', status: 'ACTIVE', joinDate: '2023-07-22', photo: null }
];

// Search Members
export async function POST(req: NextRequest) {
  try {
    const { query, status, membershipType, limit = 10 } = await req.json();

    // Return mock data if database not configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      let filtered = [...mockMembers];
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(m =>
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q)
        );
      }
      if (status && status !== 'ALL') {
        filtered = filtered.filter(m => m.status === status);
      }
      if (membershipType && membershipType !== 'ALL') {
        filtered = filtered.filter(m => m.membershipType === membershipType);
      }
      return NextResponse.json({
        success: true,
        count: filtered.slice(0, limit).length,
        members: filtered.slice(0, limit),
        _notice: 'Using demo data. Configure DATABASE_URL to connect to your database.'
      });
    }

    const where: any = {};

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (membershipType && membershipType !== 'ALL') {
      where.membershipType = membershipType;
    }

    const members = await prisma.member.findMany({
      where,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        membershipType: true,
        status: true,
        joinDate: true,
        photo: true
      }
    });

    return NextResponse.json({
      success: true,
      count: members.length,
      members
    });

  } catch (error: any) {
    console.error('Search members error:', error);
    return NextResponse.json(
      { error: 'Failed to search members', details: error.message },
      { status: 500 }
    );
  }
}
