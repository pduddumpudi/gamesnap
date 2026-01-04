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

    const openAiKey = process.env.OPENAI_API_KEY;
    const openAiModel = process.env.OPENAI_OCR_MODEL || 'gpt-5.2';
    const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (openAiKey) {
      const openAiResult = await runOpenAiOcr(base64Image, openAiKey, openAiModel);
      if (openAiResult) {
        return NextResponse.json(openAiResult);
      }
    }

    if (!googleApiKey) {
      console.warn('No OCR keys configured (OPENAI_API_KEY or GOOGLE_CLOUD_API_KEY)');
      // Return mock data for development
      return NextResponse.json(getMockOCRResponse(page_number));
    }

    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`,
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

async function runOpenAiOcr(base64Image: string, apiKey: string, model: string): Promise<OCRResponse | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  'Extract chess moves from the scoresheet image.',
                  'Return ONLY valid JSON with this schema:',
                  '{ "moves": [{ "move_number": number, "white": string, "black": string }],',
                  '"metadata": { "white_player": string?, "black_player": string?, "result": "1-0"|"0-1"|"1/2-1/2"|"*" },',
                  '"raw_text": string }',
                  'Use SAN for moves. If black move missing, return empty string.',
                ].join(' ')
              },
              {
                type: 'input_image',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn('OpenAI OCR failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const textOutput = extractTextFromOpenAiResponse(data);
    const parsedJson = safeJsonParse(textOutput);
    if (!parsedJson || !Array.isArray(parsedJson.moves)) {
      return null;
    }

    const parsedText = parsedJson.raw_text || '';
    const parsed = parseScoresheet(parsedText);
    const mergedMoves = parsedJson.moves.map((move: any, index: number) => ({
      move_number: typeof move.move_number === 'number' ? move.move_number : index + 1,
      white: String(move.white || ''),
      black: String(move.black || ''),
      confidence: {
        white: 0.9,
        black: move.black ? 0.85 : 1.0,
      },
    }));

    return {
      moves: mergedMoves.length > 0 ? mergedMoves : parsed.moves,
      metadata: parsedJson.metadata || {
        white_player: parsed.white_player,
        black_player: parsed.black_player,
        result: parsed.result as any,
      },
      raw_text: parsedText,
      low_confidence_indices: mergedMoves
        .map((move, index) => (move.white ? -1 : index))
        .filter((i) => i !== -1),
    };
  } catch (error) {
    console.warn('OpenAI OCR exception:', error);
    return null;
  }
}

function extractTextFromOpenAiResponse(data: any): string {
  if (typeof data?.output_text === 'string') {
    return data.output_text;
  }
  const output = data?.output;
  if (!Array.isArray(output)) {
    return '';
  }
  const texts: string[] = [];
  for (const item of output) {
    const content = item?.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (typeof part?.text === 'string') {
        texts.push(part.text);
      }
    }
  }
  return texts.join('\n');
}

function safeJsonParse(text: string): any | null {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
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
