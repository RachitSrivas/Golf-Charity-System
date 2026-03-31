import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext(null);

// Create client with whatever values are in env — if placeholder, auth just won't work
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
const IS_CONFIGURED = !SUPABASE_URL.includes('placeholder');

// createClient is fine with any string for URL/key — it only fails on network calls
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function AuthProvider({ children }) {
  const [user, setUser]                 = useState(null);
  const [profile, setProfile]           = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!IS_CONFIGURED) {
      // No real Supabase — skip auth entirely
      setLoading(false);
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        localStorage.setItem('sb-access-token', session.access_token);
        await fetchProfile();
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        localStorage.setItem('sb-access-token', session.access_token);
        await fetchProfile();
      } else {
        setUser(null);
        setProfile(null);
        setSubscription(null);
        localStorage.removeItem('sb-access-token');
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('sb-access-token');
      if (!token) return;
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user || null);
        setSubscription(data.subscription || null);
      }
      // If the API call fails (e.g. DB schema not run yet), user is still authenticated
      // via Supabase Auth — dashboard will show empty states gracefully
    } catch {}
  };

  const login = async (email, password) => {
    if (!IS_CONFIGURED) throw new Error('Add real Supabase credentials to client/.env to enable login.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user && data.session) {
      // Set user IMMEDIATELY so ProtectedRoute sees it before navigate() fires
      setUser(data.user);
      localStorage.setItem('sb-access-token', data.session.access_token);
      fetchProfile(); // fire-and-forget — dashboard works even if backend/DB not ready
    }
    return data;
  };

  const register = async (email, password, full_name) => {
    if (!IS_CONFIGURED) throw new Error('Add real Supabase credentials to client/.env to enable registration.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    if (IS_CONFIGURED) await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('sb-access-token');
    setUser(null);
    setProfile(null);
    setSubscription(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, subscription, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
