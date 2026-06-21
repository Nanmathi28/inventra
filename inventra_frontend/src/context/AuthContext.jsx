import { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest, api } from '../services/api';

const AuthContext = createContext();

function buildUserObject(profile) {
  const name = profile.full_name || profile.email;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();
  const roleTitles = {
    admin: 'Administrator',
    pharmacist: 'Senior Pharmacist',
    customer: 'Registered Patient',
  };
  return {
    id: profile.id,
    name,
    email: profile.email,
    role: profile.role,
    title: roleTitles[profile.role] || 'Team Member',
    avatar: initials,
    avatarColor:
      profile.role === 'admin'
        ? 'from-blue-500 to-blue-700'
        : profile.role === 'pharmacist'
        ? 'from-emerald-500 to-emerald-700'
        : 'from-purple-500 to-purple-700',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function restoreUser() {
      const token = localStorage.getItem('inventra_token');
      if (!token) {
        localStorage.removeItem('inventra_user');
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const profile = await api.get('/auth/profile');
        const userData = buildUserObject(profile);
        localStorage.setItem('inventra_user', JSON.stringify(userData));
        setUser(userData);
      } catch (err) {
        localStorage.removeItem('inventra_token');
        localStorage.removeItem('inventra_user');
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    restoreUser();
  }, []);

  async function login(email, password) {
    console.log('AuthContext login called with:', { email });
    try {
      const loginData = await loginRequest(email, password);
      console.log('AuthContext login response:', loginData);
      localStorage.setItem('inventra_token', loginData.access_token);
      const userData = buildUserObject(loginData.user);
      localStorage.setItem('inventra_user', JSON.stringify(userData));
      setUser(userData);
      return { ok: true, user: userData };
    } catch (error) {
      console.error('AuthContext login error:', error);
      return { ok: false, error: error.message || 'Login failed' };
    }
  }

  async function register(fullName, email, password, role) {
    console.log('AuthContext register called with:', { fullName, email, role });
    try {
      const registerData = await registerRequest({ full_name: fullName, email, password, role });
      console.log('AuthContext register response:', registerData);
      localStorage.setItem('inventra_token', registerData.access_token);
      const userData = buildUserObject(registerData.user);
      localStorage.setItem('inventra_user', JSON.stringify(userData));
      setUser(userData);
      return { ok: true, user: userData };
    } catch (error) {
      console.error('AuthContext register error:', error);
      return { ok: false, error: error.message || 'Registration failed' };
    }
  }

  function logout() {
    localStorage.removeItem('inventra_token');
    localStorage.removeItem('inventra_user');
    setUser(null);
  }

  function updateProfile(updates) {
    setUser(u => {
      const updated = { ...u, ...updates };
      localStorage.setItem('inventra_user', JSON.stringify(updated));
      return updated;
    });
  }

  function markRead(id) {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, login, register, logout, updateProfile, notifications, markRead, markAllRead }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
