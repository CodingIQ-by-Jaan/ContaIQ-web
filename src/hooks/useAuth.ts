import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/api/supabase';
import { api } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const store = useAuthStore();
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  const fetchUserData = useCallback(async (accessToken: string): Promise<boolean> => {
    try {
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      store.setProfile(data.profile);
      store.setOrganizations(data.organizations);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        store.setSession(session);
        await fetchUserData(session.access_token);
      }
      store.setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return;

        if (event === 'SIGNED_IN' && session) {
          store.setLoading(true);
          store.setSession(session);
          await fetchUserData(session.access_token);
          store.setLoading(false);
        }

        if (event === 'TOKEN_REFRESHED' && session) {
          store.setSession(session);
        }

        if (event === 'SIGNED_OUT') {
          store.reset();
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    store.setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        store.setLoading(false);
        throw error;
      }
    } catch (err) {
      store.setLoading(false);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.session) {
      store.setLoading(true);
      store.setSession(data.session);

      await api.post('/auth/profile', { fullName }, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      await fetchUserData(data.session.access_token);
      store.setLoading(false);
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