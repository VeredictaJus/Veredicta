import { supabase } from '@/lib/supabase';

export interface Writer {
  id: string;
  firebase_uid: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  avatar_url?: string;
  specialization?: string;
  petitions_count?: number;
}

export class WriterService {
  /**
   * Buscar todos os redatores ativos
   */
  static async getActiveWriters(): Promise<Writer[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          firebase_uid,
          full_name,
          email,
          role,
          is_active,
          avatar_url
        `)
        .eq('role', 'writer')
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar redatores:', error);
        throw new Error('Erro ao buscar redatores');
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar redatores:', error);
      throw error;
    }
  }

  /**
   * Buscar redatores com contagem de petições
   */
  static async getWritersWithPetitionCount(): Promise<Writer[]> {
    try {
      // Buscar redatores
      const writers = await this.getActiveWriters();

      // Para cada redator, buscar contagem de petições
      const writersWithCount = await Promise.all(
        writers.map(async (writer) => {
          try {
            const { count } = await supabase
              .from('petitions')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_writer_id', writer.firebase_uid);

            return {
              ...writer,
              petitions_count: count || 0
            };
          } catch (error) {
            console.error(`Erro ao contar petições do redator ${writer.full_name}:`, error);
            return {
              ...writer,
              petitions_count: 0
            };
          }
        })
      );

      return writersWithCount;
    } catch (error) {
      console.error('Erro ao buscar redatores com contagem:', error);
      throw error;
    }
  }

  /**
   * Buscar redatores disponíveis (com menos petições)
   */
  static async getAvailableWriters(): Promise<Writer[]> {
    try {
      const writers = await this.getWritersWithPetitionCount();
      
      // Ordenar por número de petições (menor primeiro)
      return writers.sort((a, b) => (a.petitions_count || 0) - (b.petitions_count || 0));
    } catch (error) {
      console.error('Erro ao buscar redatores disponíveis:', error);
      throw error;
    }
  }

  /**
   * Buscar redator por ID
   */
  static async getWriterById(writerId: string): Promise<Writer | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          firebase_uid,
          full_name,
          email,
          role,
          is_active,
          avatar_url
        `)
        .eq('firebase_uid', writerId)
        .eq('role', 'writer')
        .single();

      if (error) {
        console.error('Erro ao buscar redator:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar redator:', error);
      return null;
    }
  }

  /**
   * Buscar redatores com petições do cliente atual
   */
  static async getWritersWithClientPetitions(clientId: string): Promise<Writer[]> {
    try {
      // Buscar petições do cliente
      const { data: petitions, error: petitionsError } = await supabase
        .from('petitions')
        .select('assigned_writer_id')
        .eq('client_id', clientId);

      if (petitionsError) {
        console.error('Erro ao buscar petições do cliente:', petitionsError);
        return [];
      }

      // Extrair IDs únicos dos redatores
      const writerIds = [...new Set(petitions?.map(p => p.assigned_writer_id).filter(Boolean))];

      if (writerIds.length === 0) {
        return [];
      }

      // Buscar dados dos redatores
      const { data: writers, error: writersError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          firebase_uid,
          full_name,
          email,
          role,
          is_active,
          avatar_url
        `)
        .in('firebase_uid', writerIds)
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (writersError) {
        console.error('Erro ao buscar redatores:', writersError);
        return [];
      }

      return writers || [];
    } catch (error) {
      console.error('Erro ao buscar redatores com petições do cliente:', error);
      return [];
    }
  }
}
