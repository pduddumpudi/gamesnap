export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">♟️</div>
            <span className="text-xl font-bold text-gray-900">GameSnap</span>
          </div>

          <nav className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
