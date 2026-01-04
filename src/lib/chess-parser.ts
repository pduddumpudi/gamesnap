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
  result.moves = extractMovesFromText(rawText, cleanedLines);

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

const extractMovesFromText = (rawText: string, lines: string[]): Move[] => {
  const tokenMoves = extractMovesFromTokens(rawText);
  if (tokenMoves.length > 0) {
    return tokenMoves;
  }

  return extractMovesFromLines(lines);
};

const extractMovesFromLines = (lines: string[]): Move[] => {
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

const extractMovesFromTokens = (rawText: string): Move[] => {
  const moves: Move[] = [];
  const tokens = tokenizeMoves(rawText);

  let currentMoveNumber: number | null = null;
  let pendingMove: Move | null = null;

  for (const token of tokens) {
    const splitToken = splitMoveNumberToken(token);
    if (splitToken) {
      if (pendingMove) {
        moves.push(pendingMove);
        pendingMove = null;
      }
      currentMoveNumber = splitToken.moveNumber;
      if (isLikelyMove(splitToken.move)) {
        pendingMove = createMove(currentMoveNumber, cleanMove(splitToken.move));
      }
      continue;
    }

    const moveNumber = parseMoveNumberToken(token);
    if (moveNumber !== null) {
      if (pendingMove) {
        moves.push(pendingMove);
        pendingMove = null;
      }
      currentMoveNumber = moveNumber;
      continue;
    }

    if (!isLikelyMove(token)) {
      continue;
    }

    const normalized = cleanMove(token);
    if (currentMoveNumber === null) {
      continue;
    }

    if (!pendingMove) {
      pendingMove = createMove(currentMoveNumber, normalized);
      continue;
    }

    if (!pendingMove.black) {
      pendingMove.black = normalized;
      continue;
    }

    moves.push(pendingMove);
    pendingMove = createMove(currentMoveNumber + 1, normalized);
    currentMoveNumber += 1;
  }

  if (pendingMove) {
    moves.push(pendingMove);
  }

  return moves;
};

const tokenizeMoves = (rawText: string): string[] => {
  return rawText
    .replace(/\|/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
};

const parseMoveNumberToken = (token: string): number | null => {
  const match = token.match(/^(\d+)[\.\)]?$/);
  if (!match) return null;
  return parseInt(match[1], 10);
};

const splitMoveNumberToken = (token: string): { moveNumber: number; move: string } | null => {
  const match = token.match(/^(\d+)[\.\)]?([A-Za-zO0].+)$/);
  if (!match) return null;
  return {
    moveNumber: parseInt(match[1], 10),
    move: match[2],
  };
};

const isLikelyMove = (token: string): boolean => {
  const normalized = normalizeMoveToken(token);
  return /^O-O(-O)?[\+\#]?$/.test(normalized) ||
    /^[KQRBN]?[a-h]?[1-8]?[x]?[a-h][1-8](=[QRBN])?[\+\#]?$/.test(normalized);
};

const createMove = (moveNumber: number, white: string): Move => ({
  move_number: moveNumber,
  white,
  black: '',
  confidence: {
    white: 0.8,
    black: 1.0,
  },
});

const cleanMove = (move: string): string => {
  if (!move) return '';

  // Remove common OCR errors and normalize
  let cleaned = normalizeMoveToken(move.trim());

  // Convert 0-0 (zeros) to O-O (letters) for castling
  // Remove spaces within moves
  cleaned = cleaned.replace(/\s/g, '');

  // Validate basic chess notation pattern
  if (!/^[NBRQK]?[a-h]?[1-8]?[x]?[a-h][1-8][\+\#]?$/.test(cleaned) &&
      !/^O-O(-O)?[\+\#]?$/.test(cleaned)) {
    // If it doesn't match standard notation, return as-is for manual review
  }

  return cleaned;
};

const normalizeMoveToken = (token: string): string => {
  let normalized = token.replace(/0-0-0/gi, 'O-O-O').replace(/0-0/gi, 'O-O');
  if (/^[kqrbn]/.test(normalized)) {
    normalized = normalized[0].toUpperCase() + normalized.slice(1);
  }
  return normalized;
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
