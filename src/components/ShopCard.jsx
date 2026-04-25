import { useNavigate } from 'react-router-dom';

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

const BADGE_CONFIG = {
  Cafe: (shop) =>
    shop.isOpenNow
      ? { label: 'Open Now', cls: 'bg-emerald-600 text-emerald-50' }
      : { label: 'Closed',   cls: 'bg-stone-400 text-stone-100' },
  Grocery: (shop) =>
    shop.attributes?.inStock
      ? { label: 'In Stock',      cls: 'bg-teal-700 text-teal-50' }
      : { label: 'Limited Stock', cls: 'bg-amber-600 text-amber-50' },
};

const FOOTER_DETAIL = {
  Cafe:  (shop) => shop.attributes?.diningType,
  Cloth: (shop) => Array.isArray(shop.attributes?.fabricTypes)
    ? shop.attributes.fabricTypes.join(', ')
    : shop.attributes?.fabricTypes,
};

export default function ShopCard({ shop }) {
  const navigate = useNavigate();
  const badge    = BADGE_CONFIG[shop.category]?.(shop);
  const detail   = FOOTER_DETAIL[shop.category]?.(shop) ?? `${shop.reviewCount ?? 0} reviews`;
  const emoji    = shop.emoji ?? CATEGORY_EMOJI[shop.category] ?? '🏪';
  const rating   = shop.rating ?? 0;
  const stars    = '★'.repeat(Math.floor(rating));

  const handleClick = () =>
    navigate(`/${shop.location.city}/${shop.category.toLowerCase()}/shop/${shop._id}`);

  return (
    <article
      onClick={handleClick}
      className="group bg-white border border-stone-100 rounded-2xl overflow-hidden
                 cursor-pointer hover:border-stone-300 transition-all duration-200"
    >
      {/* Cover */}
      <div
        className={`relative h-40 flex items-center justify-center overflow-hidden
          ${CATEGORY_BG[shop.category] ?? 'bg-stone-50'}`}
      >
        {badge && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-medium
                        tracking-widest uppercase px-3 py-1 rounded-full ${badge.cls}`}
          >
            {badge.label}
          </span>
        )}
        {shop.coverImage
          ? <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
          : <span className="text-5xl">{emoji}</span>
        }
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400 mb-1">
          {shop.category}
        </p>
        <h3 className="font-serif text-lg font-bold leading-snug mb-1">{shop.name}</h3>
        <p className="text-xs text-stone-400 font-light mb-3">{shop.location?.address}</p>

        {/* Tags */}
        {shop.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {shop.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] border border-stone-200 rounded px-2 py-0.5 text-stone-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2.5 border-t border-stone-100 mt-1">
          <span className="text-sm font-medium">
            {stars} {rating.toFixed(1)}
          </span>
          <span className="text-xs text-stone-400 truncate max-w-[55%]">{detail}</span>
        </div>
      </div>
    </article>
  );
}
