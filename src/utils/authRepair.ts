import { ProfileService } from '@/services/profileService';
import { supabase } from '@/lib/supabaseClient'

/**
 * Authentication Repair Utility
 * Fixes common authentication issues and ensures data consistency
 */
export class AuthRepair {
  /**
   * Repairs missing profiles for existing authenticated users
   */
  static async repairMissingProfiles(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('Starting profile repair process...');
      
      const result = await ProfileService.repairMissingProfiles();
      
      if (result.errors > 0) {
        return {
          success: false,
          message: `Profile repair completed with errors. Repaired: ${result.repaired}, Errors: ${result.errors}`,
          details: result
        };
      }
      
      return {
        success: true,
        message: `Profile repair completed successfully. Repaired: ${result.repaired} profiles.`,
        details: result
      };
    } catch (error) {
      console.error('Profile repair failed:', error);
      return {
        success: false,
        message: 'Profile repair failed due to unexpected error',
        details: error
      };
    }
  }

  /**
   * Validates current user authentication state
   */
  static async validateCurrentUser(): Promise<{ valid: boolean; message: string; user?: any }> {
    try {
      // Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        return {
          valid: false,
          message: `Session error: ${sessionError.message}`
        };
      }
      
      if (!session?.user) {
        return {
          valid: false,
          message: 'No active session'
        };
      }
      
      // Check if profile exists
      const profile = await ProfileService.getUserProfile(session.user.id);
      
      if (!profile) {
        return {
          valid: false,
          message: 'User authenticated but no profile exists',
          user: session.user
        };
      }
      
      return {
        valid: true,
        message: 'User authentication state is valid',
        user: {
          auth: session.user,
          profile: profile
        }
      };
    } catch (error) {
      return {
        valid: false,
        message: `Validation error: ${error}`,
      };
    }
  }

  /**
   * Force logout and clear all authentication data
   */
  static async forceLogout(): Promise<void> {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any localStorage data
      localStorage.removeItem('veredicta_user');
      localStorage.removeItem('veredicta_auth_token');
      
      console.log('Force logout completed');
    } catch (error) {
      console.error('Error during force logout:', error);
    }
  }

  /**
   * Creates a missing profile for the current authenticated user
   */
  static async createMissingProfile(
    userType: 'client' | 'writer' | 'admin',
    fullName?: string
  ): Promise<{ success: boolean; message: string; profile?: any }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return {
          success: false,
          message: 'No authenticated user found'
        };
      }
      
      // Check if profile already exists
      const existingProfile = await ProfileService.getUserProfile(session.user.id);
      if (existingProfile) {
        return {
          success: true,
          message: 'Profile already exists',
          profile: existingProfile
        };
      }
      
      // Create new profile
      const profile = await ProfileService.createUserProfile(
        session.user.id,
        session.user.email!,
        userType,
        fullName
      );
      
      if (profile) {
        return {
          success: true,
          message: 'Profile created successfully',
          profile: profile
        };
      } else {
        return {
          success: false,
          message: 'Failed to create profile'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error creating profile: ${error}`
      };
    }
  }
}