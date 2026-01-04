'use client';

import { useEffect, useState } from 'react';
import { Move } from '@/types';

interface ChessBoardProps {
  currentMoveIndex: number;
  moves: Move[];
}

export default function ChessBoard({ currentMoveIndex, moves }: ChessBoardProps) {
  const [position, setPosition] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  useEffect(() => {
    // TODO: Use chess.js to calculate position after currentMoveIndex
    // For now, just show starting position
  }, [currentMoveIndex, moves]);

  // Simple board rendering (will be replaced with actual library integration)
  const renderSquare = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const color = isLight ? 'bg-amber-200' : 'bg-amber-700';

    return (
      <div
        key={`${row}-${col}`}
        className={`w-12 h-12 ${color} flex items-center justify-center text-2xl`}
      >
        {/* TODO: Add piece rendering */}
      </div>
    );
  };

  return (
    <div className="inline-block">
      <div className="border-4 border-gray-800 rounded">
        {[...Array(8)].map((_, row) => (
          <div key={row} className="flex">
            {[...Array(8)].map((_, col) => renderSquare(row, col))}
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Move {currentMoveIndex + 1} of {moves.length}</p>
        <p className="text-xs mt-1">
          Note: Full chessboard integration coming soon
        </p>
      </div>
    </div>
  );
}
