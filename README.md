# GameSnap - Chess Scoresheet to PGN Converter

Convert handwritten chess scoresheets to PGN format instantly with AI-powered OCR.

## Features

- 📷 Camera-first capture with gallery fallback
- 📄 Multi-page scoresheet support
- ✅ Smart validation with interactive error correction
- 🎯 Per-user handwriting learning
- 🔄 Direct export to Lichess & Chess.com
- 📝 Full NAG annotation support (!, ?, !!, ??, !?, ?!)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript
- **Styling**: Tailwind CSS
- **Chess Logic**: chess.js + chessboardjsx
- **Database**: Supabase (PostgreSQL)
- **OCR**: Google Cloud Vision API
- **Hosting**: Vercel

## Project Structure

```
gamesnap/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── review/       # Review page
│   │   └── export/       # Export page
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── public/               # Static assets
└── ...config files
```

## Development Phases

See the [plan file](../.claude/plans/snuggly-kindling-kazoo.md) for detailed implementation phases.

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
