import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

// GET - Fetch single repository
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const repository = await prisma.gitHubRepository.findUnique({
      where: { id }
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(repository);

  } catch (error) {
    console.error('Error fetching repository:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository' },
      { status: 500 }
    );
  }
}

// PUT - Update repository settings (for admin dashboard)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      displayInPortfolio,
      customTitle,
      customDescription,
      customTags,
      displayOrder
    } = body;

    // Validate input
    if (displayInPortfolio !== undefined && typeof displayInPortfolio !== 'boolean') {
      return NextResponse.json(
        { error: 'displayInPortfolio must be a boolean' },
        { status: 400 }
      );
    }

    if (displayOrder !== undefined && (typeof displayOrder !== 'number' || displayOrder < 0)) {
      return NextResponse.json(
        { error: 'displayOrder must be a non-negative number' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (displayInPortfolio !== undefined) updateData.displayInPortfolio = displayInPortfolio;
    if (customTitle !== undefined) updateData.customTitle = customTitle;
    if (customDescription !== undefined) updateData.customDescription = customDescription;
    if (customTags !== undefined) updateData.customTags = customTags;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const updatedRepository = await prisma.gitHubRepository.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      repository: updatedRepository
    });

  } catch (error) {
    console.error('Error updating repository:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update repository' },
      { status: 500 }
    );
  }
}

// DELETE - Remove repository from database
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.gitHubRepository.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Repository deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting repository:', error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete repository' },
      { status: 500 }
    );
  }
}
