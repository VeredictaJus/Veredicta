import { supabase } from '@/lib/supabaseClient'

export interface ClientProfileData {
  user_id: string;
  company_name: string;
  cnpj: string;
  contact_person: string;
  phone: string;
  address?: string;
  plan_id?: string;
  credits_balance?: number;
}

class ClientProfileService {
  async createProfile(profileData: Omit<ClientProfileData, 'user_id'> & { user_id: string }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_2d8133c678_client_profiles')
        .insert([{
          user_id: profileData.user_id,
          company_name: profileData.company_name,
          cnpj: profileData.cnpj,
          contact_person: profileData.contact_person,
          phone: profileData.phone,
          address: profileData.address || '',
          plan_id: profileData.plan_id || '1', // Default plan
          credits_balance: profileData.credits_balance || 0
        }]);

      if (error) {
        console.error('Error creating client profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return false;
    }
  }

  async getProfile(userId: string): Promise<ClientProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('app_2d8133c678_client_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching client profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }
}

export const clientProfileService = new ClientProfileService();