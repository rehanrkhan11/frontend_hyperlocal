import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const [mode,    setMode]    = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'customer', city: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    if (mode === 'register' && !form.name) { setError('Name is required.'); return; }

    setLoading(true);
    try {
      const endpoint = mode === 'login'
        ? `${BASE_URL}/api/auth/login`
        : `${BASE_URL}/api/auth/register`;

      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Guard against non-JSON responses (e.g. Render spin-up HTML page)
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server is starting up, please try again in a moment.');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      login(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white
    focus:outline-none focus:border-stone-400 text-stone-700 placeholder:text-stone-300`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-300 hover:text-stone-600 text-xl leading-none"
        >
          ✕
        </button>

        {/* Header */}
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-1">
          Hyperlocal Marketplace
        </p>
        <h2 className="font-serif text-2xl font-bold mb-6">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>

        {/* Toggle */}
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all capitalize
                ${mode === m ? 'bg-white shadow text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {mode === 'register' && (
            <input className={inputCls} placeholder="Full name" value={form.name} onChange={set('name')} />
          )}
          <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set('email')} />
          <input className={inputCls} type="password" placeholder="Password" value={form.password} onChange={set('password')} />

          {mode === 'register' && (
            <>
              <select className={inputCls} value={form.role} onChange={set('role')}>
                <option value="customer">Customer</option>
                <option value="shopOwner">Shop Owner</option>
              </select>
              <select className={inputCls} value={form.city} onChange={set('city')}>
                <option value="">Select your city…</option>
                {CITIES.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </>
          )}

          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 bg-stone-900 text-white text-sm py-3 rounded-xl
                       hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </div>

        <p className="text-center text-xs text-stone-400 mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="underline hover:text-stone-600 transition-colors"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
