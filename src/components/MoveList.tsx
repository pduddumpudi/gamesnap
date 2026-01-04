'use client';

import { Move, ValidationError } from '@/types';

interface MoveListProps {
  moves: Move[];
  currentMoveIndex: number;
  validationErrors: ValidationError[];
  onMoveClick: (index: number) => void;
  onMoveCorrection: (index: number, newMove: string, color: 'white' | 'black') => void;
}

export default function MoveList({
  moves,
  currentMoveIndex,
  validationErrors,
  onMoveClick,
  onMoveCorrection,
}: MoveListProps) {
  const hasError = (index: number) => {
    return validationErrors.some((err) => err.index === index);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-gray-50">
          <tr className="text-left text-sm text-gray-600">
            <th className="px-2 py-2">#</th>
            <th className="px-2 py-2">White</th>
            <th className="px-2 py-2">Black</th>
            <th className="px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {moves.map((move, index) => {
            const isActive = index === currentMoveIndex;
            const error = hasError(index);

            return (
              <tr
                key={index}
                onClick={() => onMoveClick(index)}
                className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                  isActive ? 'bg-blue-100' : ''
                } ${error ? 'bg-red-50' : ''}`}
              >
                <td className="px-2 py-2 text-sm font-medium text-gray-700">
                  {move.move_number}.
                </td>
                <td className="px-2 py-2">
                  <span className={getConfidenceColor(move.confidence.white)}>
                    {move.white}
                  </span>
                  {move.white_nag && (
                    <span className="ml-1 text-gray-500">{move.white_nag}</span>
                  )}
                </td>
                <td className="px-2 py-2">
                  {move.black && (
                    <>
                      <span className={getConfidenceColor(move.confidence.black)}>
                        {move.black}
                      </span>
                      {move.black_nag && (
                        <span className="ml-1 text-gray-500">{move.black_nag}</span>
                      )}
                    </>
                  )}
                </td>
                <td className="px-2 py-2">
                  {error && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      Error
                    </span>
                  )}
                  {!error && move.confidence.white < 0.7 && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Low confidence
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {moves.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No moves detected
        </div>
      )}
    </div>
  );
}
