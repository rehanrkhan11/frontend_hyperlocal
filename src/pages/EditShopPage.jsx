import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = ['Grocery', 'Cafe', 'Cloth', 'Other'];
const CITIES     = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];
const DAYS       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function EditShopPage() {
  const { shopId }       = useParams();
  const { token }        = useAuth();
  const navigate         = useNavigate();

  const [form,    setForm]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/shops/${shopId}`)
      .then((r) => r.json())
      .then((d) => { setForm(d.shop); setLoading(false); })
      .catch(() => { setError('Failed to load shop.'); setLoading(false); });
  }, [shopId]);

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
      const days = (f.hours?.days ?? []).includes(day)
        ? f.hours.days.filter((d) => d !== day)
        : [...(f.hours?.days ?? []), day];
      return { ...f, hours: { ...f.hours, days } };
    });
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: Array.isArray(form.tags) ? form.tags : form.tags?.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res  = await fetch(`/api/shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update.');
      setSuccess(true);
      setTimeout(() => navigate('/my-shops'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white
    focus:outline-none focus:border-stone-500 text-stone-700 placeholder:text-stone-300 transition-colors`;

  if (loading) return (
    <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
    </div>
  );

  if (error && !form) return (
    <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  if (success) return (
    <main className="min-h-screen bg-stone-50 pt-20 flex flex-col items-center justify-center">
      <p className="text-6xl mb-4">✅</p>
      <h2 className="font-serif text-3xl font-bold mb-2">Shop updated!</h2>
      <p className="text-sm text-stone-400">Redirecting…</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-stone-50 pt-20 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <nav className="text-xs text-stone-400 mb-8 flex gap-2 items-center">
          <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/my-shops" className="hover:text-stone-700 transition-colors">My Shops</Link>
          <span>/</span>
          <span className="text-stone-600">Edit Shop</span>
        </nav>

        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-2">Edit</p>
        <h1 className="font-serif text-4xl font-bold mb-8 leading-tight">{form.name}</h1>

        {/* Basic Info */}
        <section className="bg-white border border-stone-100 rounded-2xl p-6 mb-6">
          <h2 className="font-serif text-lg font-bold mb-5">Basic Information</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Shop Name</label>
              <input className={inputCls} value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Description</label>
              <textarea className={`${inputCls} resize-none h-20`} value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Category</label>
              <select className={inputCls} value={form.category ?? ''} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Tags</label>
              <input className={inputCls}
                value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags ?? ''}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="organic, 24/7, home delivery" />
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white border border-stone-100 rounded-2xl p-6 mb-6">
          <h2 className="font-serif text-lg font-bold mb-5">Location</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Street Address</label>
              <input className={inputCls} value={form.location?.address ?? ''}
                onChange={(e) => set('location.address', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">City</label>
                <select className={inputCls} value={form.location?.city ?? ''}
                  onChange={(e) => set('location.city', e.target.value.toLowerCase())}>
                  {CITIES.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Pincode</label>
                <input className={inputCls} value={form.location?.pincode ?? ''}
                  onChange={(e) => set('location.pincode', e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* Hours */}
        <section className="bg-white border border-stone-100 rounded-2xl p-6 mb-6">
          <h2 className="font-serif text-lg font-bold mb-5">Operating Hours</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Opens at</label>
                <input type="time" className={inputCls} value={form.hours?.open ?? ''}
                  onChange={(e) => set('hours.open', e.target.value)} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-stone-400 mb-1.5 block">Closes at</label>
                <input type="time" className={inputCls} value={form.hours?.close ?? ''}
                  onChange={(e) => set('hours.close', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-400 mb-2 block">Open on</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all
                      ${(form.hours?.days ?? []).includes(day)
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-transparent border-stone-200 text-stone-500 hover:border-stone-400'}`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => navigate('/my-shops')}
            className="flex-1 text-sm border border-stone-200 py-4 rounded-2xl hover:border-stone-400 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-[2] bg-stone-900 text-white text-sm py-4 rounded-2xl
                       hover:bg-stone-700 transition-colors disabled:opacity-40 font-medium">
            {saving ? 'Saving…' : 'Save Changes →'}
          </button>
        </div>
      </div>
    </main>
  );
}
