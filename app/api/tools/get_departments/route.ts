import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data for demo mode
const mockDepartments = [
  { id: '1', name: 'Worship Team', description: 'Music and worship ministry', type: 'WORSHIP', headId: null, isActive: true, memberCount: 12, recordCount: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'Youth Ministry', description: 'Ministry for young adults', type: 'YOUTH', headId: null, isActive: true, memberCount: 25, recordCount: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'Children\'s Ministry', description: 'Sunday school and kids programs', type: 'CHILDREN', headId: null, isActive: true, memberCount: 18, recordCount: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', name: 'Ushering Team', description: 'Welcome and hospitality', type: 'USHERING', headId: null, isActive: true, memberCount: 15, recordCount: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', name: 'Media Team', description: 'Audio/visual and streaming', type: 'MEDIA', headId: null, isActive: true, memberCount: 8, recordCount: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', name: 'Prayer Ministry', description: 'Intercessory prayer team', type: 'PRAYER', headId: null, isActive: true, memberCount: 20, recordCount: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
];

export async function POST(req: NextRequest) {
  try {
    const { isActive, type } = await req.json();

    // Return mock data if database not configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      let filtered = [...mockDepartments];
      if (typeof isActive === 'boolean') {
        filtered = filtered.filter(d => d.isActive === isActive);
      }
      if (type && type !== 'ALL') {
        filtered = filtered.filter(d => d.type === type);
      }
      return NextResponse.json({
        success: true,
        count: filtered.length,
        departments: filtered,
        _notice: 'Using demo data. Configure DATABASE_URL to connect to your database.'
      });
    }

    const where: any = {};

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        _count: {
          select: {
            members: true,
            records: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      count: departments.length,
      departments: departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        type: dept.type,
        headId: dept.headId,
        isActive: dept.isActive,
        memberCount: dept._count.members,
        recordCount: dept._count.records,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt
      }))
    });

  } catch (error: any) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Failed to get departments', details: error.message },
      { status: 500 }
    );
  }
}
