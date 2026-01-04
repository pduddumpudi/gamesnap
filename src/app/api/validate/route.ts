import { NextRequest, NextResponse } from 'next/server';
import { validateMoves } from '@/lib/validation';
import { ValidationResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { moves } = await request.json();

    if (!moves || !Array.isArray(moves)) {
      return NextResponse.json(
        { error: 'Moves array is required' },
        { status: 400 }
      );
    }

    // Validate the moves
    const validationResult: ValidationResponse = validateMoves(moves);

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to validate moves',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
