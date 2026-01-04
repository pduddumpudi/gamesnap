'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import MoveList from '@/components/MoveList';
import ChessBoard from '@/components/ChessBoard';
import { Move, ValidationError } from '@/types';

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const [moves, setMoves] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [originalImage, setOriginalImage] = useState<string>('');

  useEffect(() => {
    // Get images from URL params or localStorage
    const processImages = async () => {
      // TODO: Get images from previous page
      // For now, use mock data
      setTimeout(() => {
        setMoves([
          { move_number: 1, white: 'e4', black: 'e5', confidence: { white: 0.95, black: 0.92 } },
          { move_number: 2, white: 'Nf3', black: 'Nc6', confidence: { white: 0.88, black: 0.85 } },
        ]);
        setIsProcessing(false);
      }, 1000);
    };

    processImages();
  }, []);

  const handleMoveClick = (index: number) => {
    setCurrentMoveIndex(index);
  };

  const handleMoveCorrection = (index: number, newMove: string, color: 'white' | 'black') => {
    const updatedMoves = [...moves];
    updatedMoves[index] = {
      ...updatedMoves[index],
      [color]: newMove,
    };
    setMoves(updatedMoves);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Reading your scoresheet...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Review & Edit Moves</h1>
            <p className="text-gray-600 mt-2">
              Check the recognized moves and make corrections if needed
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original Image */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Original Scoresheet</h2>
              {originalImage ? (
                <img
                  src={originalImage}
                  alt="Original scoresheet"
                  className="w-full h-auto rounded border border-gray-300"
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Right: Chess Board & Moves */}
            <div className="space-y-4">
              {/* Chess Board */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Board Position</h2>
                <ChessBoard currentMoveIndex={currentMoveIndex} moves={moves} />
              </div>

              {/* Move List */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Moves</h2>
                <MoveList
                  moves={moves}
                  currentMoveIndex={currentMoveIndex}
                  validationErrors={validationErrors}
                  onMoveClick={handleMoveClick}
                  onMoveCorrection={handleMoveCorrection}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Back
            </button>

            <button
              onClick={() => {
                // TODO: Navigate to export page
                console.log('Export PGN');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Export PGN →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
