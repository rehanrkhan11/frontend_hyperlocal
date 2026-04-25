import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const emptyItem = () => ({ name: '', price: '', quantity: '', unit: '', inStock: true });

export default function ManageInventoryPage() {
  const { shopId }       = useParams();
  const { token }        = useAuth();
  const navigate         = useNavigate();

  const [shop,    setShop]    = useState(null);
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch(`/api/shops/${shopId}`)
      .then((r) => r.json())
      .then((d) => {
        setShop(d.shop);
        setItems(d.shop.inventory?.length ? d.shop.inventory.map((i) => ({
          _id: i._id, name: i.name, price: String(i.price),
          quantity: String(i.quantity ?? ''), unit: i.unit ?? '', inStock: i.inStock ?? true,
        })) : [emptyItem()]);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load shop.'); setLoading(false); });
  }, [shopId]);

  const setItem = (idx, key, val) =>
    setItems((list) => list.map((it, i) => i === idx ? { ...it, [key]: val } : it));

  const addRow = () => setItems((l) => [...l, emptyItem()]);

  const removeRow = (idx) =>
    setItems((l) => l.length === 1 ? [emptyItem()] : l.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setError('');
    const inventory = items
      .filter((i) => i.name.trim())
      .map((i) => ({
        ...(i._id ? { _id: i._id } : {}),
        name:     i.name.trim(),
        price:    parseFloat(i.price) || 0,
        quantity: parseInt(i.quantity) || 0,
        unit:     i.unit.trim(),
        inStock:  i.inStock,
      }));

    setSaving(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inventory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white
    focus:outline-none focus:border-stone-500 text-stone-700 placeholder:text-stone-300 w-full transition-colors`;

  if (loading) return (
    <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-stone-50 pt-20 pb-16 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <nav className="text-xs text-stone-400 mb-8 flex gap-2 items-center flex-wrap">
          <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/my-shops" className="hover:text-stone-700 transition-colors">My Shops</Link>
          <span>/</span>
          <span className="text-stone-600 truncate max-w-[140px]">{shop?.name}</span>
          <span>/</span>
          <span className="text-stone-600">Inventory</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-1">Inventory</p>
            <h1 className="font-serif text-3xl font-bold leading-tight">{shop?.name}</h1>
            <p className="text-sm text-stone-400 mt-0.5">{items.filter(i => i.name).length} item{items.filter(i => i.name).length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={addRow}
            className="text-xs border border-stone-200 px-4 py-2 rounded-xl
                       hover:border-stone-400 transition-colors text-stone-600 whitespace-nowrap">
            + Add Item
          </button>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm
                          rounded-xl px-4 py-3 mb-6">
            ✓ Inventory saved successfully.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto_auto] gap-3 px-4 mb-2">
          {['Name', 'Price (₹)', 'Qty', 'Unit', 'In Stock', ''].map((h) => (
            <p key={h} className="text-[10px] uppercase tracking-wide text-stone-400">{h}</p>
          ))}
        </div>

        {/* Item rows */}
        <div className="flex flex-col gap-3 mb-6">
          {items.map((item, idx) => (
            <div key={idx}
              className="bg-white border border-stone-100 rounded-2xl p-4
                         grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto_auto] gap-3 items-center">

              <div className="col-span-2 sm:col-span-1">
                <label className="sm:hidden text-[10px] uppercase tracking-wide text-stone-400 mb-1 block">Name</label>
                <input className={inputCls} placeholder="Item name"
                  value={item.name} onChange={(e) => setItem(idx, 'name', e.target.value)} />
              </div>

              <div>
                <label className="sm:hidden text-[10px] uppercase tracking-wide text-stone-400 mb-1 block">Price</label>
                <input className={inputCls} placeholder="0" type="number" min="0"
                  value={item.price} onChange={(e) => setItem(idx, 'price', e.target.value)} />
              </div>

              <div>
                <label className="sm:hidden text-[10px] uppercase tracking-wide text-stone-400 mb-1 block">Qty</label>
                <input className={inputCls} placeholder="0" type="number" min="0"
                  value={item.quantity} onChange={(e) => setItem(idx, 'quantity', e.target.value)} />
              </div>

              <div>
                <label className="sm:hidden text-[10px] uppercase tracking-wide text-stone-400 mb-1 block">Unit</label>
                <input className={inputCls} placeholder="kg / pcs"
                  value={item.unit} onChange={(e) => setItem(idx, 'unit', e.target.value)} />
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setItem(idx, 'inStock', !item.inStock)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0
                    ${item.inStock ? 'bg-emerald-500' : 'bg-stone-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                    ${item.inStock ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <button onClick={() => removeRow(idx)}
                className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none justify-self-center">
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3">
          <button onClick={addRow}
            className="text-xs border border-dashed border-stone-300 py-4 rounded-2xl flex-1
                       hover:border-stone-500 text-stone-400 hover:text-stone-600 transition-colors">
            + Add another item
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-[2] bg-stone-900 text-white text-sm py-4 rounded-2xl
                       hover:bg-stone-700 transition-colors disabled:opacity-40 font-medium">
            {saving ? 'Saving…' : 'Save Inventory →'}
          </button>
        </div>
      </div>
    </main>
  );
}
