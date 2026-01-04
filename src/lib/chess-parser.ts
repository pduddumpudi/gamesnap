// Chess notation parsing utilities

import { Move } from '@/types';

export interface ParsedScoresheet {
  moves: Move[];
  white_player?: string;
  black_player?: string;
  result?: string;
}

/**
 * Parse raw OCR text into structured moves
 * Handles common scoresheet formats with White/Black columns
 */
export const parseScoresheet = (rawText: string): ParsedScoresheet => {
  const lines = rawText.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  const result: ParsedScoresheet = {
    moves: [],
  };

  // Try to extract player names from top of sheet
  const { white_player, black_player, cleanedLines } = extractPlayerNames(lines);
  result.white_player = white_player;
  result.black_player = black_player;

  // Parse moves
  result.moves = extractMoves(cleanedLines);

  // Try to extract result
  result.result = extractResult(rawText);

  return result;
};

const extractPlayerNames = (lines: string[]): {
  white_player?: string;
  black_player?: string;
  cleanedLines: string[];
} => {
  let white_player: string | undefined;
  let black_player: string | undefined;
  const cleanedLines: string[] = [];

  // Look for patterns like "White: John Doe" or "W: John Doe"
  for (const line of lines) {
    const whiteMatch = line.match(/(?:white|w):\s*([a-zA-Z\s]+)/i);
    const blackMatch = line.match(/(?:black|b):\s*([a-zA-Z\s]+)/i);

    if (whiteMatch) {
      white_player = whiteMatch[1].trim();
    } else if (blackMatch) {
      black_player = blackMatch[1].trim();
    } else {
      cleanedLines.push(line);
    }
  }

  return { white_player, black_player, cleanedLines };
};

const extractMoves = (lines: string[]): Move[] => {
  const moves: Move[] = [];

  for (const line of lines) {
    // Try to match move number and moves
    // Pattern: "1. e4 e5" or "1 e4 e5" or even "1|e4|e5"
    const moveMatch = line.match(/(\d+)[\.\s|]+([a-zA-Z0-9\-\+\#\=]+)[\s|]*([a-zA-Z0-9\-\+\#\=]*)/);

    if (moveMatch) {
      const [, moveNum, white, black] = moveMatch;

      // Clean moves (remove non-chess characters)
      const whiteMove = cleanMove(white);
      const blackMove = cleanMove(black);

      if (whiteMove) {
        moves.push({
          move_number: parseInt(moveNum, 10),
          white: whiteMove,
          black: blackMove || '',
          confidence: {
            white: 0.8, // Default confidence
            black: blackMove ? 0.8 : 1.0,
          },
        });
      }
    }
  }

  return moves;
};

const cleanMove = (move: string): string => {
  if (!move) return '';

  // Remove common OCR errors and normalize
  let cleaned = move.trim();

  // Convert 0-0 (zeros) to O-O (letters) for castling
  cleaned = cleaned.replace(/0-0-0/g, 'O-O-O');
  cleaned = cleaned.replace(/0-0/g, 'O-O');

  // Remove spaces within moves
  cleaned = cleaned.replace(/\s/g, '');

  // Validate basic chess notation pattern
  if (!/^[NBRQK]?[a-h]?[1-8]?[x]?[a-h][1-8][\+\#]?$/.test(cleaned) &&
      !/^O-O(-O)?[\+\#]?$/.test(cleaned)) {
    // If it doesn't match standard notation, return as-is for manual review
  }

  return cleaned;
};

const extractResult = (rawText: string): string | undefined => {
  // Look for result patterns: 1-0, 0-1, 1/2-1/2, *
  const resultMatch = rawText.match(/(1-0|0-1|1\/2-1\/2|\*)/);
  return resultMatch ? resultMatch[1] : undefined;
};

/**
 * Auto-stitch multi-page scoresheets by move numbers
 */
export const stitchPages = (pages: ParsedScoresheet[]): ParsedScoresheet => {
  if (pages.length === 0) {
    return { moves: [] };
  }

  if (pages.length === 1) {
    return pages[0];
  }

  // Sort pages by first move number
  const sortedPages = pages.sort((a, b) => {
    const firstMoveA = a.moves[0]?.move_number || 0;
    const firstMoveB = b.moves[0]?.move_number || 0;
    return firstMoveA - firstMoveB;
  });

  // Combine moves
  const allMoves: Move[] = [];
  for (const page of sortedPages) {
    allMoves.push(...page.moves);
  }

  // Take metadata from first page
  return {
    moves: allMoves,
    white_player: sortedPages[0].white_player,
    black_player: sortedPages[0].black_player,
    result: sortedPages[sortedPages.length - 1].result || sortedPages[0].result,
  };
};

/**
 * Detect column alignment (paired vs sequential)
 * Returns true if moves are paired (W1-B1, W2-B2), false if sequential (W1-W40, B1-B40)
 */
export const detectColumnAlignment = (rawText: string): 'paired' | 'sequential' => {
  // Simple heuristic: if we see move numbers in sequence on same line, it's paired
  const lines = rawText.split('\n');
  let pairedCount = 0;
  let sequentialCount = 0;

  for (const line of lines) {
    if (/\d+[\.\s]+[a-zA-Z0-9]+[\s]+[a-zA-Z0-9]+/.test(line)) {
      pairedCount++;
    } else if (/\d+[\.\s]+[a-zA-Z0-9]+$/.test(line)) {
      sequentialCount++;
    }
  }

  return pairedCount > sequentialCount ? 'paired' : 'sequential';
};
