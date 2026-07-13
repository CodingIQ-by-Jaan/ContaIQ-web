import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import type { UserProfile, OrgMembership } from '@/shared/types';

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  organizations: OrgMembership[];
  activeOrgId: string | null;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile) => void;
  setOrganizations: (orgs: OrgMembership[]) => void;
  setActiveOrgId: (orgId: string) => void;
  getAccessToken: () => string | null;
  getActiveOrgId: () => string | null;
  getActiveOrg: () => OrgMembership | undefined;
  getActiveRole: () => string | null;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      profile: null,
      organizations: [],
      activeOrgId: null,
      isLoading: true,

      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setOrganizations: (organizations) => {
        const state = get();
        const updates: Partial<AuthState> = { organizations };

        if (!state.activeOrgId && organizations.length > 0) {
          updates.activeOrgId = organizations[0].organizationId;
        }
        if (state.activeOrgId && !organizations.find((o) => o.organizationId === state.activeOrgId)) {
          updates.activeOrgId = organizations[0]?.organizationId ?? null;
        }

        set(updates);
      },
      setActiveOrgId: (orgId) => set({ activeOrgId: orgId }),
      getAccessToken: () => get().session?.access_token ?? null,
      getActiveOrgId: () => get().activeOrgId,
      getActiveOrg: () => {
        const { organizations, activeOrgId } = get();
        return organizations.find((o) => o.organizationId === activeOrgId);
      },
      getActiveRole: () => get().getActiveOrg()?.role ?? null,
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ session: null, profile: null, organizations: [], activeOrgId: null, isLoading: false }),
    }),
    { name: 'contaiq-auth', partialize: (state) => ({ activeOrgId: state.activeOrgId }) },
  ),
);
