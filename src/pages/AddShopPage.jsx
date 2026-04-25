import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from '../components/AuthModal.jsx';

const CATEGORIES = ['Grocery', 'Cafe', 'Cloth', 'Other'];
const CITIES     = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];
const DAYS       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CATEGORY_ATTRS = {
  Cafe:    [{ key: 'diningType', label: 'Dining Type', placeholder: 'e.g. Dine-in, Takeaway' },
            { key: 'cuisines',   label: 'Cuisines',    placeholder: 'e.g. Italian, Indian' },
            { key: 'avgCost',    label: 'Avg Cost (₹)', placeholder: '250' }],
  Grocery: [{ key: 'deliveryRadius', label: 'Delivery Radius (km)', placeholder: '3' },
            { key: 'organicCertified', label: 'Organic Certified?', placeholder: 'Yes / No' }],
  Cloth:   [{ key: 'fabricTypes', label: 'Fabric Types', placeholder: 'Cotton, Silk, Linen' },
            { key: 'gender',      label: 'Gender Focus', placeholder: 'Men, Women, Unisex' },
            { key: 'priceRange',  label: 'Price Range',  placeholder: 'Budget / Mid / Premium' }],
  Other:   [],
};

export default function AddShopPage() {
  const { token, isOwner } = useAuth();
  const navigate            = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', category: '',
    location: { address: '', city: '', pincode: '', coordinates: [0, 0] },
    hours: { open: '', close: '', days: [] },
    tags: '',
    attributes: {},
  });
  const [attrValues, setAttrValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const set = (path, value) => {
    setForm((f) => {
      const next = { ...f };
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const toggleDay = (day) => {
    setForm((f) => {
      const days = f.hours.days.includes(day)
        ? f.hours.days.filter((d) => d !== day)
        : [...f.hours.days, day];
      return { ...f, hours: { ...f.hours, days } };
    });
  };

  const handleAttr = (key, val) => setAttrValues((v) => ({ ...v, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    if (!form.name)                   { setError('Shop name is required.');      return; }
    if (!form.category)               { setError('Category is required.');       return; }
    if (!form.location.address)       { setError('Address is required.');        return; }
    if (!form.location.city)          { setError('City is required.');           return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        attributes: attrValues,
      };

      const res  = await fetch('/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create shop.');
      setSuccess(true);
      setTimeout(() => navigate('/my-shops'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white
    focus:outline-none focus:border-stone-500 text-stone-700 placeholder:text-stone-300 transition-colors`;

  if (!token) {
    return (
      <main className="min-h-screen bg-stone-50 pt-20 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">🔐</p>
          <h2 className="font-serif text-2xl font-bold mb-2">Sign in to add a shop</h2>
          <p className="text-sm text-stone-400 mb-6">You need a Shop Owner account to register your shop.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-stone-900 text-white text-sm px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Sign in / Register
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="min-h-screen bg-stone-50 pt-20 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">🏪</p>
        <h2 className="font-serif text-2xl font-bold mb-2">Shop Owners Only</h2>
        <p className="text-sm text-stone-400 mb-6">Register a new account with the "Shop Owner" role to list your shop.</p>
        <Link to="/" className="text-sm underline text-stone-500 hover:text-stone-800">← Back to Home</Link>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-stone-50 pt-20 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="font-serif text-3xl font-bold mb-2">Shop registered!</h2>
          <p className="text-sm text-stone-400">Redirecting to your shops…</p>
        </div>
      </main>
    );
  }

  const attrFields = CATEGORY_ATTRS[form.category] ?? [];

  return (
    <main className="min-h-screen bg-stone-50 pt-20 pb-16 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <nav className="text-xs text-stone-400 mb-8 flex gap-2 items-center">
          <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/my-shops" className="hover:text-stone-700 transition-colors">My Shops</Link>
          <span>/</span>
          <span className="text-stone-600">Add Shop</span>
        </nav>

        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-2">Shop Tender</p>
        <h1 className="font-serif text-4xl font-bold mb-1 leading-tight">Register your shop</h1>
        <p className="text-sm text-stone-400 font-light mb-10">
          Fill in the details below to list your shop on the marketplace.
        </p>

        {/* ── Section 1: Basic Info ── */}
        <section className="bg-white border border-stone-100 rounded-2xl p-6 mb-6">
          <h2 className="font-serif text-lg font-bold mb-5">Basic Information</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Shop Name *</label>
              <input className={inputCls} placeholder="e.g. Sharma General Store" value={form.name}
                onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Description</label>
              <textarea
                className={`${inputCls} resize-none h-20`}
                placeholder="What makes your shop special? (max 500 chars)"
                maxLength={500}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Category *</label>
              <select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Choose a category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Tags</label>
              <input className={inputCls} placeholder="organic, 24/7, home delivery  (comma separated)"
                value={form.tags} onChange={(e) => set('tags', e.target.value)} />
            </div>
          </div>
        </section>

        {/* ── Section 2: Location ── */}
        <section className="bg-white border border-stone-100 rounded-2xl p-6 mb-6">
          <h2 className="font-serif text-lg font-bold mb-5">Location</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Street Address *</label>
              <input className={inputCls} placeholder="e.g. 12, Main Market, Lajpat Nagar"
                value={form.location.address} onChange={(e) => set('location.address', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">City *</label>
                <select className={inputCls} value={form.location.city}
                  onChange={(e) => set('location.city', e.target.value.toLowerCase())}>
                  <option value="">Select city…</option>
                  {CITIES.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Pincode</label>
                <input className={inputCls} placeholder="110024"
                  value={form.location.pincode} onChange={(e) => set('location.pincode', e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Hours ── */}
        <section className="bg-white border border-stone-100 rounded-2xl p-6 mb-6">
          <h2 className="font-serif text-lg font-bold mb-5">Operating Hours</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Opens at</label>
                <input type="time" className={inputCls} value={form.hours.open}
                  onChange={(e) => set('hours.open', e.target.value)} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Closes at</label>
                <input type="time" className={inputCls} value={form.hours.close}
                  onChange={(e) => set('hours.close', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-2 block">Open on</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all
                      ${form.hours.days.includes(day)
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-transparent border-stone-200 text-stone-500 hover:border-stone-400'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Category Attributes ── */}
        {form.category && attrFields.length > 0 && (
          <section className="bg-white border border-stone-100 rounded-2xl p-6 mb-6">
            <h2 className="font-serif text-lg font-bold mb-1">{form.category} Details</h2>
            <p className="text-xs text-stone-400 mb-5">These help customers find your shop more easily.</p>
            <div className="flex flex-col gap-4">
              {attrFields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">{label}</label>
                  <input className={inputCls} placeholder={placeholder}
                    value={attrValues[key] ?? ''} onChange={(e) => handleAttr(key, e.target.value)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-stone-900 text-white text-sm py-4 rounded-2xl
                     hover:bg-stone-700 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Registering shop…' : 'Register Shop →'}
        </button>
      </div>
    </main>
  );
}
