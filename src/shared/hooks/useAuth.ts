import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/shared/api/supabase';
import { api, setAuthInterceptors } from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/authStore';

export const useAuth = () => {
  const store = useAuthStore();
  const navigate = useNavigate();
  const initializedRef = useRef(false);
  const fetchingRef = useRef(false);

  // Wire up interceptors once
  useEffect(() => {
    setAuthInterceptors(store.getAccessToken, store.getActiveOrgId);
  }, []);

  // Fetch user profile and orgs
  const fetchUserData = useCallback(async (accessToken: string) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      store.setProfile(data.profile);
      store.setOrganizations(data.organizations);
    } catch {
      // Profile doesn't exist yet — user needs onboarding
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Listen for Supabase auth state changes (once)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        store.setSession(session);

        if (session) {
          await fetchUserData(session.access_token);
        } else {
          store.reset();
        }

        store.setLoading(false);
      },
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        store.setLoading(false);
      }
    });

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
      await api.post('/auth/profile', { fullName }, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
    }

    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    store.reset();
    navigate('/login');
  }, [navigate]);

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