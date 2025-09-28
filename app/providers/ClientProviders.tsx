'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth Context
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    checkAuthStatus();
  }, []);

    // Helper function to decode JWT token client-side
  const decodeJWTToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // First, check if token is expired
      const decoded = decodeJWTToken(token);
      if (decoded && decoded.exp && Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }

      const apiUrl = API_URL ? `${API_URL}/api/auth/me` : '/api/auth/me';
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 405) {
        // Method not allowed - route might not be compiled yet
        // Fallback: use cached user data if available
        const userData = localStorage.getItem('userData');
        if (userData) {
          console.log('Using fallback auth from cached user data');
          setUser(JSON.parse(userData));
        } else if (decoded && decoded.id) {
          console.log('Using fallback auth from token');
          // Create basic user object from token as last resort
          setUser({
            id: decoded.id,
            email: decoded.email || '',
            firstName: '',
            lastName: '',
            role: 'user' // default role
          });
        }
      } else {
        console.log('Auth check failed with status:', response.status);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Don't remove token on network errors, might be temporary
      console.log('Network error during auth check, keeping token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const apiUrl = API_URL ? `${API_URL}/api/auth/login` : '/api/auth/login';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const apiUrl = API_URL ? `${API_URL}/api/auth/signup` : '/api/auth/signup';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, firstName, lastName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Main Client Providers Component
const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default ClientProviders;
