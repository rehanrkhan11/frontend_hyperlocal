import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from '../components/AuthModal.jsx';

const CATEGORY_BG = {
  Grocery: 'bg-green-50',
  Cafe:    'bg-orange-50',
  Cloth:   'bg-pink-50',
  Other:   'bg-sky-50',
};

const CATEGORY_EMOJI = {
  Grocery: '🥬',
  Cafe:    '☕',
  Cloth:   '🧵',
  Other:   '🏪',
};

function ConfirmModal({ shopName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-serif text-lg font-bold mb-2">Deactivate shop?</h3>
        <p className="text-sm text-stone-400 mb-6">
          <strong className="text-stone-700">{shopName}</strong> will be hidden from the marketplace.
          You can reactivate it anytime.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 text-sm border border-stone-200 rounded-xl py-2.5 hover:border-stone-400 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 text-sm bg-red-500 text-white rounded-xl py-2.5 hover:bg-red-600 transition-colors">
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyShopsPage() {
  const { token, user, isOwner } = useAuth();
  const navigate                  = useNavigate();

  const [shops,    setShops]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [confirm,  setConfirm]  = useState(null); // { id, name }
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch('/api/shops/mine', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setShops(d.shops ?? []); setLoading(false); })
      .catch(() => { setError('Failed to load shops.'); setLoading(false); });
  }, [token]);

  const handleDeactivate = async (id) => {
    try {
      const res = await fetch(`/api/shops/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed.');
      setShops((s) => s.map((sh) => sh._id === id ? { ...sh, isActive: false } : sh));
      setActionMsg('Shop deactivated.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch {
      setError('Could not deactivate shop.');
    } finally {
      setConfirm(null);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-stone-50 pt-20 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">🔐</p>
          <h2 className="font-serif text-2xl font-bold mb-2">Sign in to view your shops</h2>
          <p className="text-sm text-stone-400 mb-6">Manage all your registered shops in one place.</p>
          <button onClick={() => setShowAuth(true)}
            className="bg-stone-900 text-white text-sm px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors">
            Sign in
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 pt-20 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <nav className="text-xs text-stone-400 mb-8 flex gap-2 items-center">
          <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-stone-600">My Shops</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-1">Dashboard</p>
            <h1 className="font-serif text-4xl font-bold leading-tight">
              My Shops
            </h1>
            <p className="text-sm text-stone-400 font-light mt-1">
              {user?.name} · {shops.length} shop{shops.length !== 1 ? 's' : ''}
            </p>
          </div>

          {isOwner && (
            <button
              onClick={() => navigate('/add-shop')}
              className="bg-stone-900 text-white text-sm px-5 py-2.5 rounded-xl
                         hover:bg-stone-700 transition-colors whitespace-nowrap"
            >
              + Add New Shop
            </button>
          )}
        </div>

        {/* Toast */}
        {actionMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm
                          rounded-xl px-4 py-3 mb-6">
            {actionMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-stone-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && shops.length === 0 && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🏗️</p>
            <h2 className="font-serif text-2xl font-bold mb-2">No shops yet</h2>
            <p className="text-sm text-stone-400 mb-6">Register your first shop and start reaching local customers.</p>
            <button
              onClick={() => navigate('/add-shop')}
              className="bg-stone-900 text-white text-sm px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
            >
              Register a Shop →
            </button>
          </div>
        )}

        {/* Shop cards */}
        {!loading && shops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <article key={shop._id}
                className="bg-white border border-stone-100 rounded-2xl overflow-hidden hover:border-stone-300 transition-all">

                {/* Cover */}
                <div className={`relative h-36 flex items-center justify-center
                  ${CATEGORY_BG[shop.category] ?? 'bg-stone-50'}`}>

                  {/* Active badge */}
                  <span className={`absolute top-3 left-3 text-[10px] font-medium
                    tracking-widest uppercase px-3 py-1 rounded-full
                    ${shop.isActive
                      ? 'bg-emerald-600 text-emerald-50'
                      : 'bg-stone-400 text-stone-100'}`}>
                    {shop.isActive ? 'Active' : 'Inactive'}
                  </span>

                  {shop.coverImage
                    ? <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
                    : <span className="text-5xl">{CATEGORY_EMOJI[shop.category] ?? '🏪'}</span>
                  }
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400 mb-1">
                    {shop.category}
                  </p>
                  <h3 className="font-serif text-lg font-bold leading-snug mb-0.5">{shop.name}</h3>
                  <p className="text-xs text-stone-400 mb-3 truncate">
                    {shop.location?.address}, {shop.location?.city}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 text-xs text-stone-500 mb-4">
                    <span>★ {(shop.rating ?? 0).toFixed(1)}</span>
                    <span>{shop.reviewCount ?? 0} reviews</span>
                    {shop.tags?.length > 0 && (
                      <span>{shop.tags.slice(0, 2).join(', ')}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => navigate(`/${shop.location.city}/${shop.category.toLowerCase()}/shop/${shop._id}`)}
                      className="flex-1 text-xs border border-stone-200 rounded-lg py-2
                                 hover:border-stone-400 transition-colors text-stone-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-shop/${shop._id}`)}
                      className="flex-1 text-xs border border-stone-200 rounded-lg py-2
                                 hover:border-stone-400 transition-colors text-stone-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/inventory/${shop._id}`)}
                      className="flex-1 text-xs border border-stone-200 rounded-lg py-2
                                 hover:border-stone-400 transition-colors text-stone-600"
                    >
                      Inventory
                    </button>
                    {shop.isActive && (
                      <button
                        onClick={() => setConfirm({ id: shop._id, name: shop.name })}
                        className="flex-1 text-xs border border-red-200 rounded-lg py-2
                                   hover:bg-red-50 transition-colors text-red-400"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmModal
          shopName={confirm.name}
          onConfirm={() => handleDeactivate(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </main>
  );
}
