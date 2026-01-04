// Core types for GameSnap

export interface Move {
  move_number: number;
  white: string;
  black: string;
  confidence: {
    white: number;
    black: number;
  };
  white_nag?: string; // Numeric Annotation Glyph (!,?, etc.)
  black_nag?: string;
}

export interface GameMetadata {
  white_player?: string;
  black_player?: string;
  result?: '1-0' | '0-1' | '1/2-1/2' | '*';
  event_name?: string;
  date_played?: string;
}

export interface OCRResponse {
  moves: Move[];
  metadata: GameMetadata;
  raw_text: string;
  low_confidence_indices: number[]; // Indices of moves needing review
}

export interface ValidationError {
  index: number; // Move index
  move: string;
  error: 'illegal' | 'ambiguous' | 'invalid_notation';
  suggestions?: string[];
  legal_moves?: string[];
}

export interface ValidationResponse {
  valid: boolean;
  errors: ValidationError[];
  final_fen?: string;
}

export interface HandwritingCorrection {
  image_hash: string;
  recognized_char: string;
  corrected_char: string;
}

export interface GameData {
  id: string;
  user_id?: string;
  pgn: string;
  metadata: GameMetadata;
  created_at: string;
}

export interface ExportTarget {
  provider: 'lichess' | 'chesscom' | 'download';
  target?: 'study' | 'library'; // For lichess/chesscom
}

export interface ExportResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// NAG symbols mapping
export const NAG_SYMBOLS = {
  '!': '$1',   // Good move
  '?': '$2',   // Mistake
  '!!': '$3',  // Brilliant move
  '??': '$4',  // Blunder
  '!?': '$5',  // Interesting move
  '?!': '$6',  // Dubious move
} as const;

export type NAGSymbol = keyof typeof NAG_SYMBOLS;
