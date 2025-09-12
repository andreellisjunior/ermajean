'use client';

import { createClient } from '@/libs/supabase/client';
import { userCache } from '@/libs/userCache';
import { useEffect, useState } from 'react';

interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  location?: string;
  has_access: boolean;
  price_id?: string;
  created_at?: string;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `profile_${id}`;
      const profileData = await userCache.get(cacheKey, async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, location, has_access, price_id, created_at')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      });

      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (userId) {
      const cacheKey = `profile_${userId}`;
      userCache.invalidate(cacheKey);
      await fetchProfile(userId);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
  };
}
