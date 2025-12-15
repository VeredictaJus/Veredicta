import { User, UserInvitation, ActivityLog, UserStats, UserRole } from '../types/user';

// Mock data for development
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@veredictajus.com',
    role: 'admin',
    status: 'active',
    avatar: '/avatars/admin.jpg',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    lastLoginAt: '2024-01-23T09:15:00Z',
    activatedAt: '2024-01-01T10:00:00Z',
    bio: 'Administrador do sistema Veredicta Jus'
  },
  {
    id: '2',
    name: 'Dr. João Silva',
    email: 'joao@veredictajus.com',
    role: 'editor',
    status: 'active',
    avatar: '/avatars/joao.jpg',
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-22T11:20:00Z',
    lastLoginAt: '2024-01-22T16:45:00Z',
    activatedAt: '2024-01-05T14:30:00Z',
    oab: 'OAB/SP 123456',
    specialty: 'Direito Civil',
    bio: 'Editor especializado em direito civil com 15 anos de experiência'
  },
  {
    id: '3',
    name: 'Dra. Maria Santos',
    email: 'maria@veredictajus.com',
    role: 'redactor',
    status: 'active',
    avatar: '/avatars/maria.jpg',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-21T13:15:00Z',
    lastLoginAt: '2024-01-21T18:30:00Z',
    activatedAt: '2024-01-10T09:30:00Z',
    oab: 'OAB/RJ 789012',
    specialty: 'Direito Penal',
    bio: 'Redatora especializada em direito penal e processual penal'
  },
  {
    id: '4',
    name: 'Dr. Carlos Oliveira',
    email: 'carlos@veredictajus.com',
    role: 'redactor',
    status: 'pending',
    createdAt: '2024-01-20T16:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
    oab: 'OAB/MG 345678',
    specialty: 'Direito Trabalhista',
    bio: 'Advogado trabalhista com foco em relações coletivas de trabalho'
  }
];

const mockInvitations: UserInvitation[] = [
  {
    id: '1',
    email: 'novo.editor@veredictajus.com',
    role: 'editor',
    invitedBy: '1',
    invitedByName: 'Administrador',
    status: 'pending',
    token: 'invite_token_123',
    createdAt: '2024-01-22T10:00:00Z',
    expiresAt: '2024-01-29T10:00:00Z'
  }
];

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Administrador',
    action: 'login',
    description: 'Login realizado com sucesso',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    createdAt: '2024-01-23T09:15:00Z'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Dr. João Silva',
    action: 'article_create',
    description: 'Criou o artigo "Novas Regras do Código Civil"',
    metadata: { articleId: '1', articleTitle: 'Novas Regras do Código Civil' },
    createdAt: '2024-01-22T16:30:00Z'
  },
  {
    id: '3',
    userId: '1',
    userName: 'Administrador',
    action: 'user_invite',
    description: 'Convidou novo.editor@veredictajus.com como Editor',
    metadata: { invitedEmail: 'novo.editor@veredictajus.com', role: 'editor' },
    createdAt: '2024-01-22T10:00:00Z'
  }
];

export class UserService {
  private static readonly USERS_KEY = 'users';
  private static readonly INVITATIONS_KEY = 'userInvitations';
  private static readonly ACTIVITY_LOGS_KEY = 'activityLogs';

  static getUsers(page = 1, limit = 10, filters?: {
    role?: UserRole;
    status?: string;
    search?: string;
  }): Promise<{
    users: User[];
    total: number;
    totalPages: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredUsers = [...mockUsers];

        if (filters) {
          if (filters.role) {
            filteredUsers = filteredUsers.filter(u => u.role === filters.role);
          }
          if (filters.status) {
            filteredUsers = filteredUsers.filter(u => u.status === filters.status);
          }
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter(u => 
              u.name.toLowerCase().includes(search) || 
              u.email.toLowerCase().includes(search)
            );
          }
        }

        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const users = filteredUsers.slice(startIndex, startIndex + limit);

        resolve({ users, total, totalPages });
      }, 300);
    });
  }

  static getUserById(id: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === id);
        resolve(user || null);
      }, 200);
    });
  }

  static updateUser(id: string, updates: Partial<User>): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index === -1) {
          reject(new Error('User not found'));
          return;
        }
        
        mockUsers[index] = {
          ...mockUsers[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        // Log activity
        this.logActivity({
          userId: id,
          userName: mockUsers[index].name,
          action: 'user_update',
          description: 'Perfil atualizado',
          metadata: { updates }
        });

        resolve(mockUsers[index]);
      }, 500);
    });
  }

  static updateUserStatus(id: string, status: User['status']): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index === -1) {
          reject(new Error('User not found'));
          return;
        }
        
        mockUsers[index].status = status;
        mockUsers[index].updatedAt = new Date().toISOString();
        
        // Log activity
        this.logActivity({
          userId: id,
          userName: mockUsers[index].name,
          action: 'user_status_change',
          description: `Status alterado para ${status}`,
          metadata: { newStatus: status }
        });

        resolve(mockUsers[index]);
      }, 300);
    });
  }

  static deleteUser(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index === -1) {
          reject(new Error('User not found'));
          return;
        }
        
        const user = mockUsers[index];
        mockUsers.splice(index, 1);
        
        // Log activity
        this.logActivity({
          userId: 'system',
          userName: 'Sistema',
          action: 'user_delete',
          description: `Usuário ${user.name} foi removido`,
          metadata: { deletedUser: user.email }
        });

        resolve();
      }, 300);
    });
  }

  static inviteUser(email: string, role: UserRole, invitedBy: string): Promise<UserInvitation> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const invitation: UserInvitation = {
          id: Date.now().toString(),
          email,
          role,
          invitedBy,
          invitedByName: mockUsers.find(u => u.id === invitedBy)?.name || 'Unknown',
          status: 'pending',
          token: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        mockInvitations.push(invitation);
        
        // Log activity
        this.logActivity({
          userId: invitedBy,
          userName: invitation.invitedByName,
          action: 'user_invite',
          description: `Convidou ${email} como ${role}`,
          metadata: { invitedEmail: email, role }
        });

        resolve(invitation);
      }, 500);
    });
  }

  static getInvitations(): Promise<UserInvitation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockInvitations]);
      }, 200);
    });
  }

  static cancelInvitation(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockInvitations.findIndex(i => i.id === id);
        if (index === -1) {
          reject(new Error('Invitation not found'));
          return;
        }
        
        const invitation = mockInvitations[index];
        mockInvitations.splice(index, 1);
        
        // Log activity
        this.logActivity({
          userId: 'system',
          userName: 'Sistema',
          action: 'invitation_cancel',
          description: `Convite para ${invitation.email} foi cancelado`,
          metadata: { cancelledInvitation: invitation.email }
        });

        resolve();
      }, 300);
    });
  }

  static getActivityLogs(page = 1, limit = 50, filters?: {
    userId?: string;
    action?: string;
    dateRange?: { start: string; end: string };
  }): Promise<{
    logs: ActivityLog[];
    total: number;
    totalPages: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredLogs = [...mockActivityLogs].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (filters) {
          if (filters.userId) {
            filteredLogs = filteredLogs.filter(l => l.userId === filters.userId);
          }
          if (filters.action) {
            filteredLogs = filteredLogs.filter(l => l.action.includes(filters.action!));
          }
          if (filters.dateRange) {
            const start = new Date(filters.dateRange.start);
            const end = new Date(filters.dateRange.end);
            filteredLogs = filteredLogs.filter(l => {
              const logDate = new Date(l.createdAt);
              return logDate >= start && logDate <= end;
            });
          }
        }

        const total = filteredLogs.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const logs = filteredLogs.slice(startIndex, startIndex + limit);

        resolve({ logs, total, totalPages });
      }, 300);
    });
  }

  static logActivity(activity: Omit<ActivityLog, 'id' | 'createdAt'>): void {
    const log: ActivityLog = {
      ...activity,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    mockActivityLogs.unshift(log);
    
    // Keep only last 1000 logs
    if (mockActivityLogs.length > 1000) {
      mockActivityLogs.splice(1000);
    }
  }

  static getUserStats(): Promise<UserStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = mockUsers.length;
        const active = mockUsers.filter(u => u.status === 'active').length;
        const inactive = mockUsers.filter(u => u.status === 'inactive').length;
        const pending = mockUsers.filter(u => u.status === 'pending').length;
        const admins = mockUsers.filter(u => u.role === 'admin').length;
        const editors = mockUsers.filter(u => u.role === 'editor').length;
        const redactors = mockUsers.filter(u => u.role === 'redactor').length;
        
        const now = new Date();
        const thisMonth = mockUsers.filter(u => {
          const created = new Date(u.createdAt);
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;
        
        const thisWeek = mockUsers.filter(u => {
          const created = new Date(u.createdAt);
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return created >= weekAgo;
        }).length;

        // Mock average logins per day
        const avgLoginsPerDay = 12;

        resolve({
          total,
          active,
          inactive,
          pending,
          admins,
          editors,
          redactors,
          thisMonth,
          thisWeek,
          avgLoginsPerDay,
        });
      }, 200);
    });
  }
}