import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/api/supabase';
import { api } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const store = useAuthStore();
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  const fetchUserData = useCallback(async (accessToken: string) => {
    try {
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      store.setProfile(data.profile);
      store.setOrganizations(data.organizations);
    } catch {
      // Profile doesn't exist yet
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Check initial session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      store.setSession(session);

      if (session) {
        await fetchUserData(session.access_token);
      }

      store.setLoading(false);
    });

    // Listen for future changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip INITIAL_SESSION since we handle it above
        if (event === 'INITIAL_SESSION') return;

        store.setSession(session);

        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await fetchUserData(session.access_token);
        }

        if (event === 'SIGNED_OUT') {
          store.reset();
        }

        store.setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.session) {
      store.setSession(data.session);

      await api.post('/auth/profile', { fullName }, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
    }

    return data;
  }, []);

  const signOut = useCallback(async () => {
      await supabase.auth.signOut({ scope: 'global' });
      store.reset();
      localStorage.clear();
      window.location.href = '/login';
  }, []);

  return {
    session: store.session,
    profile: store.profile,
    organizations: store.organizations,
    activeOrgId: store.activeOrgId,
    isLoading: store.isLoading,
    isAuthenticated: !!store.session,
    hasOrganization: store.organizations.length > 0,
    activeRole: store.getActiveRole(),
    setActiveOrgId: store.setActiveOrgId,
    signIn,
    signUp,
    signOut,
  };
};