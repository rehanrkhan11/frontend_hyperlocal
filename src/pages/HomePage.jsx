import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const CITIES     = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];
const CATEGORIES = ['Grocery', 'Cafe', 'Cloth', 'Other'];

export default function HomePage() {
  const [city, setCity] = useState('');
  const [cat,  setCat]  = useState('');
  const navigate         = useNavigate();
  const { user, isOwner } = useAuth();

  const handleExplore = () => {
    if (!city) return;
    navigate(`/${city.toLowerCase()}/${cat ? cat.toLowerCase() : 'all'}`);
  };

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-20 pt-28">
      <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400 mb-3">
        Hyperlocal Marketplace
      </p>
      <h1 className="font-serif text-6xl font-bold text-center leading-tight mb-2 tracking-tight">
        Your city.<br />
        <em className="italic text-stone-400">Your shops.</em>
      </h1>
      <p className="text-sm text-stone-400 font-light mb-12 text-center max-w-sm">
        Discover grocery stores, cafes, cloth shops and more — right where you are.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <select value={city} onChange={(e) => setCity(e.target.value)}
          className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white
                     focus:outline-none focus:border-stone-400 text-stone-700">
          <option value="">Select city…</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={cat} onChange={(e) => setCat(e.target.value)}
          className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white
                     focus:outline-none focus:border-stone-400 text-stone-700">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={handleExplore} disabled={!city}
          className="bg-stone-900 text-white text-sm px-6 py-3 rounded-xl
                     hover:bg-stone-700 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
          Explore →
        </button>
      </div>

      {/* Category quick-links */}
      <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-lg">
        {[
          { label: 'Grocery', emoji: '🥬', bg: 'bg-green-50'  },
          { label: 'Cafe',    emoji: '☕', bg: 'bg-orange-50' },
          { label: 'Cloth',   emoji: '🧵', bg: 'bg-pink-50'   },
          { label: 'Other',   emoji: '🏪', bg: 'bg-sky-50'    },
        ].map(({ label, emoji, bg }) => (
          <button key={label}
            onClick={() => city
              ? navigate(`/${city.toLowerCase()}/${label.toLowerCase()}`)
              : setCity('Delhi')
            }
            className={`${bg} rounded-2xl py-5 flex flex-col items-center gap-2
                        border border-transparent hover:border-stone-200 transition-all`}>
            <span className="text-3xl">{emoji}</span>
            <span className="text-xs font-medium text-stone-600 tracking-wide">{label}</span>
          </button>
        ))}
      </div>

      {/* CTA for shop owners */}
      {isOwner && (
        <div className="mt-12 text-center">
          <p className="text-xs text-stone-400 mb-3">You're a shop owner.</p>
          <button onClick={() => navigate('/add-shop')}
            className="text-sm border border-stone-200 px-6 py-2.5 rounded-xl
                       hover:border-stone-500 text-stone-600 transition-colors">
            + Register a new shop
          </button>
        </div>
      )}
    </main>
  );
}
