// ============================================================
// Tipos del frontend — basados en las respuestas del API
// No depende de un paquete compartido, se mantiene independiente
// ============================================================

// Auth
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface OrgMembership {
  id: string;
  organizationId: string;
  role: Role;
  organization: OrganizationSummary;
}

export interface AuthMe {
  profile: UserProfile;
  organizations: OrgMembership[];
}

// Organization
export interface OrganizationSummary {
  id: string;
  name: string;
  tradeName: string | null;
  rtn: string;
  plan: Plan;
  logo: string | null;
}

export interface Organization extends OrganizationSummary {
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  department: string | null;
  isActive: boolean;
  trialEndsAt: string | null;
  createdAt: string;
}

// Members
export interface OrgMember {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  isActive: boolean;
  joinedAt: string;
  user: UserProfile;
}

// Enums
export type Role = 'OWNER' | 'ADMIN' | 'USER' | 'VIEWER';
export type Plan = 'CONTADOR' | 'PRO' | 'PREMIUM';
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST' | 'EXPENSE';
export type DocumentStatus = 'DRAFT' | 'CONFIRMED' | 'VOIDED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID';

// API Response
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
