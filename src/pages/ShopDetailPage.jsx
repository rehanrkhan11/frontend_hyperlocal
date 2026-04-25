import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ReviewSection from '../components/ReviewSection.jsx';

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

export default function ShopDetailPage() {
  const { shopId, cityName } = useParams();
  const { user, token }      = useAuth();
  const navigate             = useNavigate();
  const [shop,    setShop]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]  = useState(null);

  useEffect(() => {
    fetch(`/api/shops/${shopId}`)
      .then((r) => { if (!r.ok) throw new Error('Shop not found.'); return r.json(); })
      .then((d) => { setShop(d.shop); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [shopId]);

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  const emoji      = CATEGORY_EMOJI[shop.category] ?? '🏪';
  const rating     = shop.rating ?? 0;
  const stars      = '★'.repeat(Math.floor(rating));
  const isOwner    = user && (shop.owner?._id === user.id || shop.owner?.id === user.id || shop.owner === user.id);
  const city       = cityName ?? shop.location?.city;

  return (
    <main className="min-h-screen bg-stone-50 px-6 pt-20 pb-16 max-w-3xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-8 flex gap-2 items-center flex-wrap">
        <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/${city}/all`} className="hover:text-stone-700 transition-colors capitalize">{city}</Link>
        <span>/</span>
        <span className="text-stone-600 truncate max-w-[180px]">{shop.name}</span>
      </nav>

      {/* Hero */}
      <div className={`w-full h-56 rounded-2xl flex items-center justify-center mb-8 overflow-hidden
        ${CATEGORY_BG[shop.category] ?? 'bg-stone-100'}`}>
        {shop.coverImage
          ? <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
          : <span className="text-8xl">{emoji}</span>
        }
      </div>

      {/* Shop info */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400 mb-1">{shop.category}</p>
            <h1 className="font-serif text-4xl font-bold mb-2">{shop.name}</h1>
          </div>
          {isOwner && (
            <div className="flex flex-col gap-2 flex-shrink-0 mt-1">
              <button onClick={() => navigate(`/edit-shop/${shopId}`)}
                className="text-xs border border-stone-200 px-3 py-1.5 rounded-full
                           hover:border-stone-400 text-stone-600 transition-colors whitespace-nowrap">
                ✏️ Edit Shop
              </button>
              <button onClick={() => navigate(`/inventory/${shopId}`)}
                className="text-xs border border-stone-200 px-3 py-1.5 rounded-full
                           hover:border-stone-400 text-stone-600 transition-colors whitespace-nowrap">
                📦 Inventory
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-stone-500 mb-1 capitalize">
          {shop.location?.address}, {shop.location?.city}
        </p>
        {shop.description && (
          <p className="text-sm text-stone-400 font-light mt-2 leading-relaxed">{shop.description}</p>
        )}

        {/* Rating + hours */}
        <div className="flex gap-6 mt-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Rating</p>
            <p className="text-sm font-medium">{stars || '☆'} {rating.toFixed(1)} ({shop.reviewCount} reviews)</p>
          </div>
          {shop.hours?.open && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Hours</p>
              <p className="text-sm font-medium">{shop.hours.open} – {shop.hours.close}</p>
            </div>
          )}
          {shop.hours?.days?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Open on</p>
              <p className="text-sm font-medium">{shop.hours.days.join(', ')}</p>
            </div>
          )}
          {shop.isOpenNow !== null && shop.isOpenNow !== undefined && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Status</p>
              <p className={`text-sm font-medium ${shop.isOpenNow ? 'text-emerald-600' : 'text-red-400'}`}>
                {shop.isOpenNow ? 'Open Now' : 'Closed'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Attributes */}
      {shop.attributes && Object.keys(shop.attributes).length > 0 && (
        <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-5">
          <h2 className="font-serif text-lg font-bold mb-4">Details</h2>
          <dl className="grid grid-cols-2 gap-y-4 text-sm">
            {Object.entries(shop.attributes).map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-stone-400 uppercase tracking-wide mb-0.5 capitalize">
                  {k.replace(/([A-Z])/g, ' $1').trim()}
                </dt>
                <dd className="font-medium text-stone-700">
                  {Array.isArray(v) ? v.join(', ') : String(v)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Tags */}
      {shop.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {shop.tags.map((tag) => (
            <span key={tag}
              className="text-xs border border-stone-200 rounded-full px-3 py-1 text-stone-500">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Inventory */}
      {shop.inventory?.length > 0 && (
        <div className="bg-white border border-stone-100 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold">Inventory</h2>
            {isOwner && (
              <button onClick={() => navigate(`/inventory/${shopId}`)}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors underline">
                Manage →
              </button>
            )}
          </div>
          <div className="divide-y divide-stone-100">
            {shop.inventory.map((item) => (
              <div key={item._id} className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.unit && <p className="text-xs text-stone-400">{item.unit}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{item.price}</p>
                  <p className={`text-[10px] uppercase tracking-wide font-medium mt-0.5
                    ${item.inStock ? 'text-emerald-600' : 'text-red-400'}`}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ReviewSection shopId={shopId} />
    </main>
  );
}
