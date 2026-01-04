// Chess move validation using chess.js

import { Chess } from 'chess.js';
import { ValidationError, ValidationResponse } from '@/types';

/**
 * Validate a sequence of moves
 * Returns validation errors and suggestions for illegal/ambiguous moves
 */
export const validateMoves = (moves: string[]): ValidationResponse => {
  const chess = new Chess();
  const errors: ValidationError[] = [];

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    try {
      const result = chess.move(move);

      if (!result) {
        // Move is illegal
        const legalMoves = chess.moves();
        const suggestions = findSimilarMoves(move, legalMoves);

        errors.push({
          index: i,
          move,
          error: 'illegal',
          suggestions,
          legal_moves: legalMoves,
        });

        // Can't continue validation if move is illegal
        break;
      }
    } catch (error) {
      // Handle ambiguous or invalid notation
      const legalMoves = chess.moves();

      // Check if it's an ambiguous move
      if (isAmbiguousMove(move, legalMoves)) {
        const suggestions = resolveAmbiguousMove(move, legalMoves);

        errors.push({
          index: i,
          move,
          error: 'ambiguous',
          suggestions,
          legal_moves: legalMoves,
        });
      } else {
        // Invalid notation
        const suggestions = findSimilarMoves(move, legalMoves);

        errors.push({
          index: i,
          move,
          error: 'invalid_notation',
          suggestions,
          legal_moves: legalMoves,
        });
      }

      // Can't continue if we hit an error
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    final_fen: chess.fen(),
  };
};

/**
 * Check if a move is ambiguous (e.g., "Nc3" when both knights can move there)
 */
const isAmbiguousMove = (move: string, legalMoves: string[]): boolean => {
  // Extract the destination square from the move
  const destMatch = move.match(/([a-h][1-8])/);
  if (!destMatch) return false;

  const dest = destMatch[1];
  const piece = move[0];

  // Count how many legal moves have the same piece and destination
  const similarMoves = legalMoves.filter((legalMove) => {
    return legalMove.includes(dest) && legalMove[0] === piece;
  });

  return similarMoves.length > 1;
};

/**
 * Resolve ambiguous move by finding all possible variations
 */
const resolveAmbiguousMove = (move: string, legalMoves: string[]): string[] => {
  const destMatch = move.match(/([a-h][1-8])/);
  if (!destMatch) return [];

  const dest = destMatch[1];
  const piece = move[0];

  // Find all legal moves with same piece and destination
  return legalMoves.filter((legalMove) => {
    return legalMove.includes(dest) && legalMove[0] === piece;
  });
};

/**
 * Find similar moves using basic string similarity
 */
const findSimilarMoves = (move: string, legalMoves: string[]): string[] => {
  const candidates = legalMoves.map((legalMove) => ({
    move: legalMove,
    score: calculateSimilarity(move, legalMove),
  }));

  // Sort by similarity and take top 3
  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, 3).map((c) => c.move);
};

/**
 * Calculate string similarity (Levenshtein distance-based)
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;

  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);

  return 1 - distance / maxLen;
};

/**
 * Get the board position after a sequence of moves
 */
export const getBoardPosition = (moves: string[]): string => {
  const chess = new Chess();

  for (const move of moves) {
    try {
      chess.move(move);
    } catch (error) {
      // If move fails, return current position
      break;
    }
  }

  return chess.fen();
};

/**
 * Get all legal moves from a position
 */
export const getLegalMoves = (fen: string): string[] => {
  try {
    const chess = new Chess(fen);
    return chess.moves();
  } catch (error) {
    return [];
  }
};

/**
 * Make a move and return the new FEN
 */
export const makeMove = (fen: string, move: string): string | null => {
  try {
    const chess = new Chess(fen);
    const result = chess.move(move);

    if (result) {
      return chess.fen();
    }
    return null;
  } catch (error) {
    return null;
  }
};
