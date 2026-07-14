import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useApi from '../hooks/useApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const api = useApi();
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialLoading(false);
      return;
    }
    api.getProfile()
      .then((data) => {
        if (data.authenticated) {
          setUser(data);
        } else {
          localStorage.removeItem('crm_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('crm_token');
      })
      .finally(() => setInitialLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('crm_token', data.token);
    setUser({
      authenticated: true,
      id: data.user.id,
      name: data.user.name,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role,
      roleLabel: data.user.role,
      avatar: data.user.avatar,
    });
    return data;
  }, [api]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // token inválido ou já expirado
    }
    localStorage.removeItem('crm_token');
    setUser(null);
  }, [api]);

  return (
    <AuthContext.Provider value={{ user, loading: initialLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
