import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = async () => {
    try {
      const res = await getCurrentUser();
      if (res.data && res.data.role) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Clear localStorage and sessionStorage first
      localStorage.clear();
      sessionStorage.clear();
      
      // Make logout requests
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        await fetch(`${baseUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
      } catch {}
      try {
        await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
      } catch {}
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
