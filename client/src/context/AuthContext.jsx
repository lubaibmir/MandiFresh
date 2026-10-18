import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const d = await api(path, { method: 'POST', body });
    localStorage.setItem('token', d.token);
    setUser(d.user);
    return d.user;
  };

  const login = (email, password) => authenticate('/auth/login', { email, password });
  const register = (form) => authenticate('/auth/register', form);
  const googleLogin = async (credential) => {
    const d = await api('/auth/google', { method: 'POST', body: { credential } });
    if (d.needsRole) return d; // new user, must pick a role
    localStorage.setItem('token', d.token);
    setUser(d.user);
    return d;
  };
  const completeGoogle = (body) => authenticate('/auth/google/complete', body);
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, completeGoogle }}>{children}</AuthContext.Provider>;
}
