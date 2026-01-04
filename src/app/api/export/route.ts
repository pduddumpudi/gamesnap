import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pgn, provider, target } = await request.json();

    if (!pgn) {
      return NextResponse.json(
        { error: 'PGN is required' },
        { status: 400 }
      );
    }

    if (provider === 'lichess') {
      return await exportToLichess(pgn, target);
    } else if (provider === 'chesscom') {
      return NextResponse.json(
        { error: 'Chess.com export coming soon' },
        { status: 501 }
      );
    } else if (provider === 'download') {
      // For download, just return success
      return NextResponse.json({ success: true, provider: 'download' });
    }

    return NextResponse.json(
      { error: 'Invalid provider' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export game',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function exportToLichess(pgn: string, target: 'study' | 'library' = 'study') {
  const accessToken = process.env.LICHESS_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Lichess access token not configured. Please set LICHESS_ACCESS_TOKEN environment variable.' },
      { status: 500 }
    );
  }

  try {
    if (target === 'study') {
      // Create a new study with the game
      const response = await fetch('https://lichess.org/api/study', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          name: 'GameSnap Import',
          pgn: pgn,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lichess API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const studyUrl = `https://lichess.org/study/${data.id}`;

      return NextResponse.json({
        success: true,
        url: studyUrl,
        provider: 'lichess',
        target: 'study',
      });
    } else {
      // Import to games library
      const response = await fetch('https://lichess.org/api/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          pgn: pgn,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lichess API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const gameUrl = data.url || 'https://lichess.org';

      return NextResponse.json({
        success: true,
        url: gameUrl,
        provider: 'lichess',
        target: 'library',
      });
    }
  } catch (error) {
    console.error('Lichess export error:', error);
    throw error;
  }
}
