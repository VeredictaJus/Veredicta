import { supabase } from '../lib/supabase';

export interface AdminStats {
  totalClients: number;
  totalWriters: number;
  totalPetitions: number;
  activeUsers: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  completedPetitions: number;
  averageRating: number;
}

export interface ClientData {
  id: string;
  email: string;
  company_name?: string;
  cnpj?: string;
  contact_person?: string;
  phone?: string;
  created_at: string;
  is_active: boolean;
  plan_id?: string;
  credits_balance?: number;
}

export interface WriterData {
  id: string;
  email: string;
  nome: string;
  especialidade: string;
  status: string;
  created_at: string;
  peticao_1_url?: string;
  peticao_2_url?: string;
  peticao_3_url?: string;
}

class AdminDataService {
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Get total clients
      const { count: totalClients } = await supabase
        .from('profiles_v2')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');

      // Get total writers
      const { count: totalWriters } = await supabase
        .from('app_2d8133c678_redatores')
        .select('*', { count: 'exact', head: true });

      // Get pending writer approvals
      const { count: pendingApprovals } = await supabase
        .from('app_2d8133c678_redatores')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // For now, use calculated values for missing data
      const totalPetitions = 0;
      const activeUsers = (totalClients || 0) + (totalWriters || 0);
      const monthlyRevenue = 0;
      const completedPetitions = 0;
      const averageRating = 4.8;

      return {
        totalClients: totalClients || 0,
        totalWriters: totalWriters || 0,
        totalPetitions,
        activeUsers,
        monthlyRevenue,
        pendingApprovals: pendingApprovals || 0,
        completedPetitions,
        averageRating
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalClients: 0,
        totalWriters: 0,
        totalPetitions: 0,
        activeUsers: 0,
        monthlyRevenue: 0,
        pendingApprovals: 0,
        completedPetitions: 0,
        averageRating: 0
      };
    }
  }

  async getAllClients(): Promise<ClientData[]> {
    try {
      // Get all client profiles
      const { data: clientProfiles, error: profileError } = await supabase
        .from('profiles_v2')
        .select('*')
        .eq('role', 'client');

      if (profileError) {
        console.error('Error fetching client profiles:', profileError);
        return [];
      }

      // Get additional client data from client_profiles table if it exists
      const { data: clientDetails, error: detailError } = await supabase
        .from('app_2d8133c678_client_profiles')
        .select('*');

      // Merge the data
      const clients: ClientData[] = (clientProfiles || []).map(profile => {
        const details = clientDetails?.find(detail => detail.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          company_name: details?.company_name,
          cnpj: details?.cnpj,
          contact_person: details?.contact_person,
          phone: details?.phone,
          created_at: profile.created_at,
          is_active: true,
          plan_id: details?.plan_id,
          credits_balance: details?.credits_balance
        };
      });

      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  async getAllWriters(): Promise<WriterData[]> {
    try {
      const { data: writers, error } = await supabase
        .from('app_2d8133c678_redatores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching writers:', error);
        return [];
      }

      return writers || [];
    } catch (error) {
      console.error('Error fetching writers:', error);
      return [];
    }
  }

  async approveWriter(writerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_2d8133c678_redatores')
        .update({ status: 'approved' })
        .eq('id', writerId);

      if (error) {
        console.error('Error approving writer:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error approving writer:', error);
      return false;
    }
  }

  async rejectWriter(writerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_2d8133c678_redatores')
        .update({ status: 'rejected' })
        .eq('id', writerId);

      if (error) {
        console.error('Error rejecting writer:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error rejecting writer:', error);
      return false;
    }
  }

  async deleteClient(clientId: string): Promise<boolean> {
    try {
      // Delete from client_profiles first
      await supabase
        .from('app_2d8133c678_client_profiles')
        .delete()
        .eq('user_id', clientId);

      // Delete from profiles
      const { error } = await supabase
        .from('profiles_v2')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  }

  async deleteWriter(writerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_2d8133c678_redatores')
        .delete()
        .eq('id', writerId);

      if (error) {
        console.error('Error deleting writer:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting writer:', error);
      return false;
    }
  }

  // Real-time subscription for admin data updates
  subscribeToDataChanges(callback: () => void) {
    const clientSubscription = supabase
      .channel('admin_clients')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles_v2' },
        callback
      )
      .subscribe();

    const writerSubscription = supabase
      .channel('admin_writers')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'app_2d8133c678_redatores' },
        callback
      )
      .subscribe();

    return () => {
      clientSubscription.unsubscribe();
      writerSubscription.unsubscribe();
    };
  }
}

export const adminDataService = new AdminDataService();