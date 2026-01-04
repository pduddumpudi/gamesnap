import { NextRequest, NextResponse } from 'next/server';
import { parseScoresheet } from '@/lib/chess-parser';
import { OCRResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { image, page_number } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Extract base64 image data
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Call Google Cloud Vision API
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
      console.warn('Google Cloud Vision API key not configured');
      // Return mock data for development
      return NextResponse.json(getMockOCRResponse(page_number));
    }

    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      throw new Error(`Vision API error: ${visionResponse.statusText}`);
    }

    const visionData = await visionResponse.json();
    const text = visionData.responses[0]?.fullTextAnnotation?.text || '';

    // Parse the OCR text into structured moves
    const parsed = parseScoresheet(text);

    // Build OCR response
    const ocrResponse: OCRResponse = {
      moves: parsed.moves,
      metadata: {
        white_player: parsed.white_player,
        black_player: parsed.black_player,
        result: parsed.result as any,
      },
      raw_text: text,
      low_confidence_indices: parsed.moves
        .map((move, index) => (move.confidence.white < 0.7 || move.confidence.black < 0.7 ? index : -1))
        .filter((i) => i !== -1),
    };

    return NextResponse.json(ocrResponse);
  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Mock OCR response for development/testing
function getMockOCRResponse(page_number: number = 1): OCRResponse {
  return {
    moves: [
      { move_number: 1, white: 'e4', black: 'e5', confidence: { white: 0.95, black: 0.92 } },
      { move_number: 2, white: 'Nf3', black: 'Nc6', confidence: { white: 0.88, black: 0.85 } },
      { move_number: 3, white: 'Bc4', black: 'Bc5', confidence: { white: 0.91, black: 0.89 } },
      { move_number: 4, white: 'b4', black: 'Bxb4', confidence: { white: 0.75, black: 0.65 } },
      { move_number: 5, white: 'c3', black: 'Ba5', confidence: { white: 0.82, black: 0.78 } },
    ],
    metadata: {
      white_player: 'Player 1',
      black_player: 'Player 2',
      result: '*',
    },
    raw_text: '1. e4 e5\n2. Nf3 Nc6\n3. Bc4 Bc5\n4. b4 Bxb4\n5. c3 Ba5',
    low_confidence_indices: [3],
  };
}
