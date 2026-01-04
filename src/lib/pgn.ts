// PGN generation utilities

import { GameMetadata, Move, NAG_SYMBOLS } from '@/types';

export interface PGNOptions {
  includeComments?: boolean;
  includeNAGs?: boolean;
}

export const generatePGN = (
  moves: Move[],
  metadata: GameMetadata,
  options: PGNOptions = { includeComments: false, includeNAGs: true }
): string => {
  const headers = generatePGNHeaders(metadata);
  const moveText = generateMoveText(moves, options);

  return `${headers}\n\n${moveText}`;
};

const generatePGNHeaders = (metadata: GameMetadata): string => {
  const headers: string[] = [];

  // Required PGN headers
  headers.push(`[Event "${metadata.event_name || '?'}"]`);
  headers.push(`[Site "?"]`);
  headers.push(`[Date "${formatPGNDate(metadata.date_played)}"]`);
  headers.push(`[Round "?"]`);
  headers.push(`[White "${metadata.white_player || '?'}"]`);
  headers.push(`[Black "${metadata.black_player || '?'}"]`);
  headers.push(`[Result "${metadata.result || '*'}"]`);

  // Optional headers
  headers.push('[Annotator "GameSnap"]');
  headers.push('[PlyCount "?"]');

  return headers.join('\n');
};

const formatPGNDate = (date?: string): string => {
  if (!date) {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  }

  // Assume date is in YYYY-MM-DD format
  const parts = date.split('-');
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
};

const generateMoveText = (moves: Move[], options: PGNOptions): string => {
  let pgn = '';
  let moveCounter = 1;

  for (const move of moves) {
    // White's move
    pgn += `${moveCounter}. ${move.white}`;

    if (options.includeNAGs && move.white_nag) {
      const nag = NAG_SYMBOLS[move.white_nag as keyof typeof NAG_SYMBOLS];
      if (nag) {
        pgn += ` ${nag}`;
      }
    }

    // Black's move (if exists)
    if (move.black) {
      pgn += ` ${move.black}`;

      if (options.includeNAGs && move.black_nag) {
        const nag = NAG_SYMBOLS[move.black_nag as keyof typeof NAG_SYMBOLS];
        if (nag) {
          pgn += ` ${nag}`;
        }
      }
    }

    pgn += ' ';
    moveCounter++;
  }

  return pgn.trim();
};

export const parsePGN = (pgn: string): { metadata: GameMetadata; moves: string[] } => {
  const lines = pgn.split('\n');
  const metadata: GameMetadata = {};
  const moves: string[] = [];

  // Parse headers
  for (const line of lines) {
    if (line.startsWith('[')) {
      const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
      if (match) {
        const [, key, value] = match;
        switch (key) {
          case 'White':
            metadata.white_player = value !== '?' ? value : undefined;
            break;
          case 'Black':
            metadata.black_player = value !== '?' ? value : undefined;
            break;
          case 'Result':
            metadata.result = value as any;
            break;
          case 'Event':
            metadata.event_name = value !== '?' ? value : undefined;
            break;
          case 'Date':
            metadata.date_played = value !== '????.??.??' ? value.replace(/\./g, '-') : undefined;
            break;
        }
      }
    } else if (line.trim() && !line.startsWith('[')) {
      // Parse move text
      const moveMatches = line.match(/\d+\.\s*([^\s]+)(?:\s+([^\s]+))?/g);
      if (moveMatches) {
        for (const moveMatch of moveMatches) {
          const parts = moveMatch.match(/\d+\.\s*([^\s]+)(?:\s+([^\s]+))?/);
          if (parts) {
            moves.push(parts[1]); // White's move
            if (parts[2]) {
              moves.push(parts[2]); // Black's move
            }
          }
        }
      }
    }
  }

  return { metadata, moves };
};
