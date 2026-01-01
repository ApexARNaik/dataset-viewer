import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const teammates = await prisma.teammate.findMany({
      include: {
        _count: {
          select: { datasets: true }
        }
      }
    });

    const totalDatasets = await prisma.dataset.count();

    const stats = teammates.map(t => ({
      name: t.name,
      count: t._count.datasets
    }));

    return NextResponse.json({
      total: totalDatasets,
      byTeammate: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
