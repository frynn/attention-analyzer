import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthResponseDto, UserDto } from '@attention/shared';
import { apiFetch, getToken, setToken, clearToken } from '../lib/api';

interface AuthContextValue {
  user: UserDto | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<UserDto>('/auth/me')
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const applyAuth = (res: AuthResponseDto) => {
    setToken(res.accessToken);
    setUser(res.user);
  };

  const login = async (email: string, password: string) => {
    const res = await apiFetch<AuthResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    applyAuth(res);
  };

  const register = async (email: string, password: string) => {
    const res = await apiFetch<AuthResponseDto>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    applyAuth(res);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
