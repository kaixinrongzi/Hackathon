'use client';
import { useState } from 'react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const res = await fetch(`http://localhost:3001/games/query?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-sky-800 mb-4">Find Similar Games</h1>
        <p className="text-gray-600 mb-8">Describe a game and discover others like it</p>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. open world survival with crafting..."
            className="flex-1 px-4 py-2 border rounded shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded shadow disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mt-6 text-left">
            {results.map((game, idx) => (
              <div key={idx} className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition">
                <h2 className="text-xl font-semibold mb-2 text-sky-700">{game.name}</h2>
                {game.header_image && (
                  <img
                    src={game.header_image}
                    alt={game.name}
                    className="rounded w-full h-48 object-cover mb-2"
                  />
                )}
                {game.website && (
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-500 hover:underline text-sm"
                  >
                    Visit Website
                  </a>
                )}
                {game.score && (
                  <p className="text-xs text-gray-500 mt-1">Relevance Score: {game.score.toFixed(4)}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !loading && (
          <p className="text-gray-400 mt-8">No results yet. Try searching something like "zombie survival game".</p>
        )}
      </div>
    </main>
  );
}
