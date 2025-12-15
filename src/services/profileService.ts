import { supabase } from '@/lib/supabaseClient'

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  user_type: 'client' | 'writer' | 'admin';
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export class ProfileService {
  /**
   * Creates a user profile in the database
   */
  static async createUserProfile(
    userId: string, 
    email: string, 
    userType: 'client' | 'writer' | 'admin',
    fullName?: string
  ): Promise<UserProfile | null> {
    try {
      const profileData = {
        user_id: userId,
        email: email,
        user_type: userType,
        full_name: fullName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles_v2')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return null;
    }
  }

  /**
   * Gets a user profile by user ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles_v2')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Gets a user profile by email
   */
  static async getUserProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles_v2')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching user profile by email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfileByEmail:', error);
      return null;
    }
  }

  /**
   * Ensures a user profile exists, creates one if it doesn't
   */
  static async ensureUserProfile(
    userId: string, 
    email: string, 
    userType: 'client' | 'writer' | 'admin'
  ): Promise<UserProfile | null> {
    try {
      // First, try to get existing profile
      let profile = await this.getUserProfile(userId);
      
      if (profile) {
        return profile;
      }

      // If no profile exists, create one
      console.log(`Creating missing profile for user ${userId}`);
      profile = await this.createUserProfile(userId, email, userType);
      
      return profile;
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      return null;
    }
  }

  /**
   * Updates an existing user profile
   */
  static async updateUserProfile(
    userId: string, 
    updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at'>>
  ): Promise<UserProfile | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles_v2')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return null;
    }
  }

  /**
   * Repairs missing profiles for all authenticated users
   */
  static async repairMissingProfiles(): Promise<{ repaired: number; errors: number }> {
    try {
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        return { repaired: 0, errors: 1 };
      }

      let repaired = 0;
      let errors = 0;

      for (const authUser of authUsers.users) {
        try {
          // Check if profile exists
          const existingProfile = await this.getUserProfile(authUser.id);
          
          if (!existingProfile && authUser.email) {
            // Create missing profile - default to client unless specified
            const userType = authUser.email.includes('admin') ? 'admin' : 
                           authUser.email.includes('redator') ? 'writer' : 'client';
            
            const newProfile = await this.createUserProfile(
              authUser.id, 
              authUser.email, 
              userType as 'client' | 'writer' | 'admin'
            );
            
            if (newProfile) {
              repaired++;
              console.log(`Repaired profile for user: ${authUser.email}`);
            } else {
              errors++;
            }
          }
        } catch (error) {
          console.error(`Error repairing profile for user ${authUser.id}:`, error);
          errors++;
        }
      }

      return { repaired, errors };
    } catch (error) {
      console.error('Error in repairMissingProfiles:', error);
      return { repaired: 0, errors: 1 };
    }
  }
}