import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface DatasetInput {
  instruction: string;
  input: string;
  output: string;
}

interface UploadRequest {
  teammateId: string;
  passcode: string;
  datasets: DatasetInput[];
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json();
    const { teammateId, passcode, datasets } = body;

    // Validate input
    if (!teammateId || !passcode || !datasets || datasets.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify teammate and passcode
    const teammate = await prisma.teammate.findUnique({
      where: { id: teammateId }
    });

    if (!teammate) {
      return NextResponse.json(
        { error: 'Teammate not found' },
        { status: 404 }
      );
    }

    if (teammate.passcode !== passcode) {
      return NextResponse.json(
        { error: 'Invalid passcode' },
        { status: 401 }
      );
    }

    // Create datasets
    const createdDatasets = await prisma.dataset.createMany({
      data: datasets.map((ds) => ({
        instruction: ds.instruction,
        input: ds.input,
        output: ds.output,
        teammateId: teammate.id
      }))
    });

    return NextResponse.json({
      success: true,
      count: createdDatasets.count,
      message: `Successfully uploaded ${createdDatasets.count} dataset(s)`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload datasets' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const datasets = await prisma.dataset.findMany({
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: true }
    });

    return NextResponse.json(datasets);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}
