'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { generatePGN } from '@/lib/pgn';
import { Move, GameMetadata } from '@/types';

export default function ExportPage() {
  const searchParams = useSearchParams();
  const [pgn, setPgn] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);

  useEffect(() => {
    // Get moves from localStorage or URL params
    const movesJson = localStorage.getItem('gamesnap_current_game');
    if (movesJson) {
      try {
        const data = JSON.parse(movesJson);
        const generatedPgn = generatePGN(
          data.moves as Move[],
          data.metadata as GameMetadata || {},
          { includeNAGs: true }
        );
        setPgn(generatedPgn);
      } catch (error) {
        console.error('Error loading game:', error);
      }
    }
  }, []);

  const handleExport = async (provider: 'lichess' | 'chesscom' | 'download', target?: 'study' | 'library') => {
    if (provider === 'download') {
      downloadPGN();
      return;
    }

    setIsExporting(true);
    setExportResult(null);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pgn, provider, target }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setExportResult({ success: true, url: data.url });
        if (data.url) {
          // Open in new tab
          window.open(data.url, '_blank');
        }
      } else {
        setExportResult({ success: false, error: data.error || 'Export failed' });
      }
    } catch (error) {
      setExportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPGN = () => {
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-${Date.now()}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportResult({ success: true });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pgn);
    alert('PGN copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Export Your Game</h1>
            <p className="text-gray-600 mt-2">
              Choose how you&apos;d like to export your game
            </p>
          </div>

          {/* PGN Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">PGN Preview</h2>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                📋 Copy
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto text-sm">
              {pgn || 'No game data available'}
            </pre>
          </div>

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Lichess Study */}
            <button
              onClick={() => handleExport('lichess', 'study')}
              disabled={isExporting || !pgn}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">♟️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lichess Study</h3>
              <p className="text-sm text-gray-600">
                Create a new study on Lichess with this game
              </p>
            </button>

            {/* Lichess Library */}
            <button
              onClick={() => handleExport('lichess', 'library')}
              disabled={isExporting || !pgn}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lichess Library</h3>
              <p className="text-sm text-gray-600">
                Import directly to your Lichess game library
              </p>
            </button>

            {/* Download PGN */}
            <button
              onClick={() => handleExport('download')}
              disabled={!pgn}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">💾</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download PGN</h3>
              <p className="text-sm text-gray-600">
                Save PGN file to your device
              </p>
            </button>
          </div>

          {/* Export Result */}
          {exportResult && (
            <div className={`rounded-lg p-4 mb-6 ${exportResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {exportResult.success ? (
                <div>
                  <p className="text-green-800 font-medium">✅ Export successful!</p>
                  {exportResult.url && (
                    <a
                      href={exportResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm underline mt-1 block"
                    >
                      Open in new tab →
                    </a>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-800 font-medium">❌ Export failed</p>
                  <p className="text-red-600 text-sm mt-1">{exportResult.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isExporting && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Exporting...</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Back to Review
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Scan Another Game
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
