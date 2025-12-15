import { User, UserRole, Permission, PERMISSIONS } from '../types/user';
import { UserService } from './userService';

export class AuthService {
  private static currentUser: User | null = null;

  static async login(email: string, password: string): Promise<User> {
    // Mock authentication - in production, validate against backend
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // For demo, accept any password for existing users
        const users = await UserService.getUsers(1, 100);
        const user = users.users.find(u => u.email === email);
        
        if (!user) {
          reject(new Error('Usuário não encontrado'));
          return;
        }

        if (user.status !== 'active') {
          reject(new Error('Conta inativa ou pendente de aprovação'));
          return;
        }

        // Update last login
        await UserService.updateUser(user.id, {
          lastLoginAt: new Date().toISOString()
        });

        // Log login activity
        UserService.logActivity({
          userId: user.id,
          userName: user.name,
          action: 'login',
          description: 'Login realizado com sucesso',
          ipAddress: '192.168.1.1', // Mock IP
          userAgent: navigator.userAgent
        });

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      }, 1000);
    });
  }

  static logout(): void {
    if (this.currentUser) {
      UserService.logActivity({
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        action: 'logout',
        description: 'Logout realizado',
        ipAddress: '192.168.1.1', // Mock IP
        userAgent: navigator.userAgent
      });
    }

    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }

    return null;
  }

  static hasPermission(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const permission = PERMISSIONS.find(p => 
      p.resource === resource && p.action === action
    );

    if (!permission) return false;

    return permission.roles.includes(user.role);
  }

  static hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role || false;
  }

  static hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  static isAdmin(): boolean {
    return this.hasRole('admin');
  }

  static isEditor(): boolean {
    return this.hasRole('editor');
  }

  static isRedactor(): boolean {
    return this.hasRole('redactor');
  }

  static canAccessRoute(requiredRoles: UserRole[]): boolean {
    return this.hasAnyRole(requiredRoles);
  }

  static getRedirectPath(): string {
    const user = this.getCurrentUser();
    if (!user) return '/login';

    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'editor':
        return '/articles';
      case 'redactor':
        return '/articles/my';
      default:
        return '/dashboard';
    }
  }
}