import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginCollector } from '../services/api';

interface AuthContextData {
  token: string | null;
  loading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AuthProvider: Initializing');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load token from storage when app starts
  useEffect(() => {
    console.log('AuthProvider: Loading token from storage');
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@auth_token');
        console.log('AuthProvider: Stored token found?', !!storedToken);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error('AuthProvider: Failed to load token from storage', e);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const signIn = async (username: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for user', username);
    try {
      setLoading(true);
      setError(null);
      const response = await loginCollector(username, password);
      console.log('AuthProvider: Sign in successful');
      
      const newToken = response.token;
      console.log('AuthProvider: New token received:', newToken);
      setToken(newToken);
      await AsyncStorage.setItem('@auth_token', newToken);
      console.log('AuthProvider: Token stored in AsyncStorage');
    } catch (e: any) {
      console.error('AuthProvider: Sign in failed', e);
      setError(e.message || 'Failed to sign in');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('AuthProvider: Signing out');
    try {
      setToken(null);
      await AsyncStorage.removeItem('@auth_token');
      console.log('AuthProvider: Token removed from storage');
    } catch (e) {
      console.error('AuthProvider: Failed to remove token from storage', e);
    }
  };

  const contextValue: AuthContextData = {
    token,
    loading,
    error,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};