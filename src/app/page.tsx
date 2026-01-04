'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
import Header from '@/components/Header';
import { stitchPages } from '@/lib/chess-parser';
import { GameMetadata, OCRResponse } from '@/types';

const normalizeResult = (result?: string): GameMetadata['result'] => {
  if (result === '1-0' || result === '0-1' || result === '1/2-1/2' || result === '*') {
    return result;
  }
  return undefined;
};

export default function Home() {
  const router = useRouter();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageCapture = (imageDataUrl: string) => {
    setCapturedImages((prev) => [...prev, imageDataUrl]);
  };

  const handleProcessImages = async () => {
    if (capturedImages.length === 0) return;

    setIsProcessing(true);

    try {
      // Call OCR API for each image
      const ocrPromises = capturedImages.map((image, index) =>
        fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image, page_number: index + 1 }),
        }).then((res) => res.json())
      );

      const ocrResults = await Promise.all(ocrPromises) as OCRResponse[];

      // Stitch multi-page results (normalize OCR metadata into parser shape)
      const stitched = stitchPages(ocrResults.map((page) => ({
        moves: page.moves,
        white_player: page.metadata?.white_player,
        black_player: page.metadata?.black_player,
        result: page.metadata?.result,
      })));

      // Store in localStorage for review page
      const metadata: GameMetadata = {
        white_player: stitched.white_player,
        black_player: stitched.black_player,
        result: normalizeResult(stitched.result),
      };
      localStorage.setItem('gamesnap_current_game', JSON.stringify({
        moves: stitched.moves,
        metadata,
        images: capturedImages,
      }));

      // Navigate to review page
      router.push('/review');
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Hmm, something went wrong processing your scoresheet. Please try again!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GameSnap
          </h1>
          <p className="text-lg text-gray-600">
            Snap a photo of your scoresheet to get started!
          </p>
        </div>

        <CameraCapture onCapture={handleImageCapture} />

        {capturedImages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Captured Pages ({capturedImages.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capturedImages.map((image, index) => (
                <div key={index} className="relative bg-white p-4 rounded-lg shadow">
                  <img
                    src={image}
                    alt={`Page ${index + 1}`}
                    className="w-full h-auto rounded"
                  />
                  <p className="text-sm text-gray-600 mt-2">Page {index + 1}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleProcessImages}
                disabled={isProcessing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Processing...
                  </span>
                ) : (
                  'Process Scoresheets →'
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
