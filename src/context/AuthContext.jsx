import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('hm_token'));

  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setUser(d.user))
      .catch(() => { setToken(null); localStorage.removeItem('hm_token'); });
  }, [token]);

  const login = (tok, userData) => {
    localStorage.setItem('hm_token', tok);
    setToken(tok);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('hm_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isOwner: user?.role === 'shopOwner' || user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
