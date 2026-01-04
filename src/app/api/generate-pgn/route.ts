import { NextRequest, NextResponse } from 'next/server';
import { generatePGN } from '@/lib/pgn';
import { Move, GameMetadata } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { moves, metadata, includeNAGs } = await request.json();

    if (!moves || !Array.isArray(moves)) {
      return NextResponse.json(
        { error: 'Moves array is required' },
        { status: 400 }
      );
    }

    // Generate PGN
    const pgn = generatePGN(
      moves as Move[],
      metadata as GameMetadata || {},
      { includeNAGs: includeNAGs !== false }
    );

    return NextResponse.json({
      pgn,
      move_count: moves.length,
    });
  } catch (error) {
    console.error('PGN generation API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PGN',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
