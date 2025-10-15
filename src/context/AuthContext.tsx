
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// Debug flag - set to true to bypass Supabase temporarily
const DEBUG_SKIP_SUPABASE = false;

type UserRole = 'student' | 'instructor' | 'admin' | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user role from profiles table
  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      // Debug bypass for testing
      if (DEBUG_SKIP_SUPABASE) {
        setUser(null);
        setIsAuthenticated(false);
        setRole(null);
        setIsLoading(false);
        return;
      }
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Auth initialization timeout - setting loading to false');
        setUser(null);
        setIsAuthenticated(false);
        setRole(null);
        setIsLoading(false);
      }, 5000); // 5 second timeout
      
      try {
        // Check if Supabase is properly configured
        if (!supabase) {
          console.error('Supabase client not initialized');
          throw new Error('Supabase client not available');
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          clearTimeout(timeoutId);
          setUser(null);
          setIsAuthenticated(false);
          setRole(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          const userRole = await fetchUserRole(session.user.id);
          setRole(userRole);
        } else {
          // No session found - user is not logged in
          setUser(null);
          setIsAuthenticated(false);
          setRole(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Even on error, we should show the login screen
        setUser(null);
        setIsAuthenticated(false);
        setRole(null);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          const userRole = await fetchUserRole(session.user.id);
          setRole(userRole);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Real login function using Supabase
  const login = async (email: string, password: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        const userRole = await fetchUserRole(data.user.id);
        setRole(userRole);
        return userRole;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Real logout function using Supabase
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }

      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout 
    }}>
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
