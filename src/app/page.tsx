'use client';

import { useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import Header from '@/components/Header';

export default function Home() {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const handleImageCapture = (imageDataUrl: string) => {
    setCapturedImages((prev) => [...prev, imageDataUrl]);
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
                onClick={() => {
                  // TODO: Navigate to review page with images
                  console.log('Processing images:', capturedImages);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Process Scoresheets →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
