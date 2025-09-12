'use client';

import { createClient } from '@/libs/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Singleton pattern for auth state to prevent multiple getUser() calls
class AuthManager {
  private static instance: AuthManager;
  private user: User | null = null;
  private loading = true;
  private listeners: Set<(user: User | null, loading: boolean) => void> =
    new Set();
  private supabase = createClient();
  private initialized = false;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // Get initial user
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      this.user = user;
      this.loading = false;
      this.notifyListeners();

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.user = session?.user || null;
        this.loading = false;
        this.notifyListeners();
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.loading = false;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.user, this.loading));
  }

  subscribe(listener: (user: User | null, loading: boolean) => void) {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.user, this.loading);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getUser() {
    return { user: this.user, loading: this.loading };
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authManager = AuthManager.getInstance();

    const unsubscribe = authManager.subscribe((newUser, newLoading) => {
      setUser(newUser);
      setLoading(newLoading);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
