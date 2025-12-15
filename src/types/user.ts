export type UserRole = 'admin' | 'editor' | 'redactor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  invitedBy?: string;
  activatedAt?: string;
  phone?: string;
  oab?: string;
  specialty?: string;
  bio?: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  admins: number;
  editors: number;
  redactors: number;
  thisMonth: number;
  thisWeek: number;
  avgLoginsPerDay: number;
}

export interface Permission {
  resource: string;
  action: string;
  roles: UserRole[];
}

export const PERMISSIONS: Permission[] = [
  // User Management
  { resource: 'users', action: 'read', roles: ['admin', 'editor'] },
  { resource: 'users', action: 'create', roles: ['admin'] },
  { resource: 'users', action: 'update', roles: ['admin'] },
  { resource: 'users', action: 'delete', roles: ['admin'] },
  { resource: 'users', action: 'invite', roles: ['admin'] },
  
  // Article Management
  { resource: 'articles', action: 'read', roles: ['admin', 'editor', 'redactor'] },
  { resource: 'articles', action: 'create', roles: ['admin', 'editor', 'redactor'] },
  { resource: 'articles', action: 'update', roles: ['admin', 'editor'] },
  { resource: 'articles', action: 'delete', roles: ['admin', 'editor'] },
  { resource: 'articles', action: 'publish', roles: ['admin', 'editor'] },
  
  // Admin Functions
  { resource: 'admin', action: 'dashboard', roles: ['admin'] },
  { resource: 'admin', action: 'settings', roles: ['admin'] },
  { resource: 'admin', action: 'logs', roles: ['admin'] },
];