import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from './AuthModal.jsx';

export default function Navbar() {
  const { user, logout, isOwner } = useAuth();
  const navigate                   = useNavigate();
  const [showAuth, setShowAuth]    = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg font-bold tracking-tight text-stone-900">
            Hyperlocal
          </Link>

          <nav className="flex items-center gap-3">
            {isOwner && (
              <>
                <button
                  onClick={() => navigate('/add-shop')}
                  className="text-xs border border-stone-200 px-4 py-1.5 rounded-full
                             hover:border-stone-400 text-stone-600 transition-colors"
                >
                  + Add Shop
                </button>
                <button
                  onClick={() => navigate('/my-shops')}
                  className="text-xs border border-stone-200 px-4 py-1.5 rounded-full
                             hover:border-stone-400 text-stone-600 transition-colors"
                >
                  My Shops
                </button>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400 hidden sm:block truncate max-w-[120px]">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-xs bg-stone-100 hover:bg-stone-200 px-4 py-1.5 rounded-full
                             text-stone-600 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-xs bg-stone-900 text-white px-4 py-1.5 rounded-full
                           hover:bg-stone-700 transition-colors"
              >
                Sign in
              </button>
            )}
          </nav>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
