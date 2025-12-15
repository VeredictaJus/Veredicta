import { supabase } from '../lib/supabase';

export interface WriterStats {
  totalPetitions: number;
  completedPetitions: number;
  pendingPetitions: number;
  totalEarnings: number;
  averageRating: number;
  completionRate: number;
  activeProjects: number;
  monthlyEarnings: number;
}

export interface WriterProfile {
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

export interface PetitionAssignment {
  id: string;
  petition_id: string;
  writer_id: string;
  status: string;
  assigned_at: string;
  completed_at?: string;
  payment_amount?: number;
  client_rating?: number;
  title: string;
  description: string;
  priority: string;
  deadline: string;
}

class WriterDataService {
  async getWriterProfile(userId: string): Promise<WriterProfile | null> {
    try {
      const { data, error } = await supabase
        .from('app_2d8133c678_redatores')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching writer profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching writer profile:', error);
      return null;
    }
  }

  async getWriterProfileByEmail(email: string): Promise<WriterProfile | null> {
    try {
      const { data, error } = await supabase
        .from('app_2d8133c678_redatores')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching writer profile by email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching writer profile by email:', error);
      return null;
    }
  }

  async getWriterStats(writerId: string): Promise<WriterStats> {
    try {
      // For now, return default values since petition system is not yet implemented
      // TODO: Implement actual petition tracking tables
      return {
        totalPetitions: 0,
        completedPetitions: 0,
        pendingPetitions: 0,
        totalEarnings: 0,
        averageRating: 0,
        completionRate: 0,
        activeProjects: 0,
        monthlyEarnings: 0
      };
    } catch (error) {
      console.error('Error fetching writer stats:', error);
      return {
        totalPetitions: 0,
        completedPetitions: 0,
        pendingPetitions: 0,
        totalEarnings: 0,
        averageRating: 0,
        completionRate: 0,
        activeProjects: 0,
        monthlyEarnings: 0
      };
    }
  }

  async getPetitionAssignments(writerId: string): Promise<PetitionAssignment[]> {
    try {
      // For now, return empty array since petition system is not yet implemented
      // TODO: Implement petition assignment tracking
      return [];
    } catch (error) {
      console.error('Error fetching petition assignments:', error);
      return [];
    }
  }

  async updateWriterProfile(writerId: string, profileData: Partial<WriterProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_2d8133c678_redatores')
        .update(profileData)
        .eq('id', writerId);

      if (error) {
        console.error('Error updating writer profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating writer profile:', error);
      return false;
    }
  }

  // Real-time subscription for writer data updates
  subscribeToWriterData(writerId: string, callback: () => void) {
    const subscription = supabase
      .channel(`writer_${writerId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'app_2d8133c678_redatores', filter: `id=eq.${writerId}` },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const writerDataService = new WriterDataService();