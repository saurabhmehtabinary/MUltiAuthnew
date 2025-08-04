import { User } from '@/types';
import { dataManager } from './dataManager';

export interface AuthSession {
  user: User;
  isAuthenticated: boolean;
  loginTime: string;
}

class AuthManager {
  private static instance: AuthManager;
  private currentSession: AuthSession | null = null;

  private constructor() {
    this.loadSession();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadSession(): void {
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        try {
          this.currentSession = JSON.parse(storedSession);
        } catch (error) {
          console.error('Failed to load session:', error);
          this.clearSession();
        }
      }
    }
  }

  private saveSession(session: AuthSession): void {
    this.currentSession = session;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify(session));
    }
  }

  private clearSession(): void {
    this.currentSession = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_session');
    }
  }

  // Authentication methods
  login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    // Simple authentication - in real app, this would be API call
    const user = dataManager.getUserByEmail(email);
    
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // For MVP, we'll accept any password for demo users
    // In real app, this would verify password hash
    const session: AuthSession = {
      user,
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
    };

    this.saveSession(session);

    return { success: true, user };
  }

  logout(): void {
    this.clearSession();
  }

  // Session management
  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  isAuthenticated(): boolean {
    return this.currentSession?.isAuthenticated || false;
  }

  // Role-based access control
  hasRole(role: User['role']): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: User['role'][]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }

  isOrgAdmin(): boolean {
    return this.hasRole('org_admin');
  }

  isOrgUser(): boolean {
    return this.hasRole('org_user');
  }

  // Organization access control
  canAccessOrganization(organizationId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admin can access all organizations
    if (user.role === 'super_admin') return true;

    // Org admin and org user can only access their organization
    return user.organizationId === organizationId;
  }

  canManageOrganization(organizationId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admin can manage all organizations
    if (user.role === 'super_admin') return true;

    // Org admin can manage their organization
    if (user.role === 'org_admin' && user.organizationId === organizationId) return true;

    return false;
  }

  canManageUser(targetUserId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admin can manage all users
    if (user.role === 'super_admin') return true;

    // Org admin can manage users in their organization
    if (user.role === 'org_admin') {
      const targetUser = dataManager.getUserById(targetUserId);
      return targetUser?.organizationId === user.organizationId;
    }

    return false;
  }

  canManageOrder(orderId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admin can manage all orders
    if (user.role === 'super_admin') return true;

    // Org admin can manage orders in their organization
    if (user.role === 'org_admin') {
      const order = dataManager.getOrderById(orderId);
      return order?.organizationId === user.organizationId;
    }

    // Org user can only manage their own orders
    if (user.role === 'org_user') {
      const order = dataManager.getOrderById(orderId);
      return order?.userId === user.id;
    }

    return false;
  }

  // Route protection helpers
  canAccessRoute(route: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Define route permissions
    const routePermissions: Record<string, User['role'][]> = {
      '/dashboard': ['super_admin', 'org_admin', 'org_user'],
      '/organizations': ['super_admin'],
      '/users': ['super_admin', 'org_admin'],
      '/orders': ['super_admin', 'org_admin', 'org_user'],
      '/logs': ['super_admin', 'org_admin'],
    };

    const allowedRoles = routePermissions[route];
    if (!allowedRoles) return true; // Allow access if no specific permissions defined

    return allowedRoles.includes(user.role);
  }

  // Utility methods
  refreshSession(): void {
    this.loadSession();
  }

  getSessionDuration(): number {
    if (!this.currentSession?.loginTime) return 0;
    return Date.now() - new Date(this.currentSession.loginTime).getTime();
  }
}

export const authManager = AuthManager.getInstance(); 