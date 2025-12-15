import { supabase } from '@/lib/supabaseClient'

export interface ActivityLogData {
  userId: string;
  activityType: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Utility to log user activities to user_activity_logs table
 * This ensures proper logging during registration and other user actions
 */
export class ActivityLogger {
  /**
   * Log a user activity
   */
  static async logActivity(data: ActivityLogData): Promise<boolean> {
    try {
      console.log('📝 ACTIVITY LOG: Recording activity', {
        userId: data.userId,
        activityType: data.activityType,
        description: data.description
      });

      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: data.userId,
          activity_type: data.activityType,
          activity_description: data.description,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          metadata: data.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Failed to log activity:', error);
        return false;
      }

      console.log('✅ Activity logged successfully');
      return true;
    } catch (error) {
      console.error('❌ Activity logging error:', error);
      return false;
    }
  }

  /**
   * Log user registration
   */
  static async logRegistration(userId: string, userType: string, metadata?: Record<string, any>): Promise<boolean> {
    return this.logActivity({
      userId,
      activityType: 'account_created',
      description: `User account created as ${userType}`,
      metadata: {
        user_type: userType,
        source: 'registration_form',
        ...metadata
      }
    });
  }

  /**
   * Log user login
   */
  static async logLogin(userId: string, method: string = 'email'): Promise<boolean> {
    return this.logActivity({
      userId,
      activityType: 'login',
      description: `User logged in via ${method}`,
      metadata: {
        login_method: method,
        source: 'login_form'
      }
    });
  }

  /**
   * Log profile updates
   */
  static async logProfileUpdate(userId: string, fieldsChanged: string[]): Promise<boolean> {
    return this.logActivity({
      userId,
      activityType: 'profile_updated',
      description: `User profile updated`,
      metadata: {
        fields_changed: fieldsChanged,
        source: 'profile_form'
      }
    });
  }

  /**
   * Log avatar upload
   */
  static async logAvatarUpload(userId: string, success: boolean): Promise<boolean> {
    return this.logActivity({
      userId,
      activityType: 'avatar_uploaded',
      description: success ? 'Avatar uploaded successfully' : 'Avatar upload failed',
      metadata: {
        success,
        source: 'avatar_upload'
      }
    });
  }

  /**
   * Get user activity logs
   */
  static async getUserActivities(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Failed to fetch user activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching user activities:', error);
      return [];
    }
  }
}