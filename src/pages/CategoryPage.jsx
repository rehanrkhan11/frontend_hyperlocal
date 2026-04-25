import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ShopCard from '../components/ShopCard.jsx';

const CATEGORIES = ['All', 'Grocery', 'Cafe', 'Cloth', 'Other'];
const SORT_OPTIONS = [
  { value: 'rating',  label: 'Top Rated' },
  { value: 'newest',  label: 'Newest'    },
  { value: 'name',    label: 'A → Z'     },
];

export default function CategoryPage() {
  const { cityName, category } = useParams();
  const navigate                = useNavigate();

  const [shops,      setShops]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search,     setSearch]     = useState('');
  const [sortBy,     setSortBy]     = useState('rating');
  const [inputVal,   setInputVal]   = useState('');

  const activeCat =
    !category || category === 'all'
      ? 'All'
      : category.charAt(0).toUpperCase() + category.slice(1);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ city: cityName, page, limit: 12, sortBy });
      if (activeCat !== 'All') params.set('category', activeCat);
      if (search) params.set('search', search);

      const res  = await fetch(`/api/shops?${params}`);
      if (!res.ok) throw new Error('Failed to fetch shops.');
      const data = await res.json();
      setShops(data.shops);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cityName, activeCat, page, sortBy, search]);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  const switchCat = (cat) => {
    setPage(1);
    setSearch('');
    setInputVal('');
    navigate(`/${cityName}/${cat === 'All' ? 'all' : cat.toLowerCase()}`, { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputVal.trim());
    setPage(1);
  };

  const clearSearch = () => { setSearch(''); setInputVal(''); setPage(1); };

  const cityLabel = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return (
    <main className="min-h-screen bg-stone-50 px-6 pt-20 pb-16 max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-8 flex gap-2 items-center">
        <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-stone-600 capitalize">{cityLabel}</span>
        {activeCat !== 'All' && (<><span>/</span><span className="text-stone-600">{activeCat}</span></>)}
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 mb-2">Hyperlocal Marketplace</p>
        <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight">
          Shops near <em className="italic text-stone-400">{cityLabel}</em>
        </h1>
        <p className="text-sm text-stone-400 font-light mt-2">
          Discover local businesses — handpicked, filtered, hyperlocal.
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search shops…"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white
                         focus:outline-none focus:border-stone-400 text-stone-700
                         placeholder:text-stone-300 pr-8"
            />
            {(inputVal || search) && (
              <button type="button" onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300
                           hover:text-stone-600 transition-colors text-sm">
                ✕
              </button>
            )}
          </div>
          <button type="submit"
            className="bg-stone-900 text-white text-xs px-4 py-2.5 rounded-xl
                       hover:bg-stone-700 transition-colors whitespace-nowrap">
            Search
          </button>
        </form>

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white
                     focus:outline-none focus:border-stone-400 text-stone-600"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => switchCat(cat)}
            className={`text-xs tracking-widest uppercase px-4 py-1.5 rounded-full border
                        transition-all duration-150
              ${activeCat === cat
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-transparent border-stone-200 text-stone-500 hover:border-stone-400'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results meta */}
      {!loading && !error && (
        <p className="text-xs text-stone-400 tracking-wide mb-5">
          {search ? `"${search}" · ` : ''}{total} shop{total !== 1 ? 's' : ''} · {cityLabel}
        </p>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-stone-100 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && shops.length === 0 && (
        <div className="text-center py-20 text-stone-400 text-sm">
          {search
            ? <>No shops found for "<strong>{search}</strong>". <button onClick={clearSearch} className="underline">Clear search</button></>
            : 'No shops found. Try a different category or city.'
          }
        </div>
      )}

      {!loading && !error && shops.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => <ShopCard key={shop._id} shop={shop} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs border border-stone-200 px-4 py-2 rounded-full
                           hover:border-stone-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                ← Prev
              </button>
              <span className="text-xs text-stone-400">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="text-xs border border-stone-200 px-4 py-2 rounded-full
                           hover:border-stone-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
