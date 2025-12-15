import { supabase } from '../lib/supabase'

/**
 * Service for executing user-related SQL functions in Supabase
 * These functions update user data without affecting the UI/design
 */
class UserActionsService {
  /**
   * Increment the trial petitions count for the current logged user
   * Calls the increment_trial_petitions SQL function
   * @param userId - The ID of the user to update
   * @returns Promise<void>
   */
  async incrementTrialPetitions(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_trial_petitions', {
        user_id: userId
      })

      if (error) {
        console.error('Error incrementing trial petitions:', error)
        throw new Error('Falha ao incrementar petições de teste')
      }

      console.log('Trial petitions incremented successfully for user:', userId)
    } catch (error) {
      console.error('Error in incrementTrialPetitions:', error)
      throw error
    }
  }

  /**
   * Mark the user as paid by calling the mark_user_as_paid SQL function
   * @param userId - The ID of the user to mark as paid
   * @returns Promise<void>
   */
  async markUserAsPaid(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('mark_user_as_paid', {
        user_id: userId
      })

      if (error) {
        console.error('Error marking user as paid:', error)
        throw new Error('Falha ao marcar usuário como pago')
      }

      console.log('User marked as paid successfully:', userId)
    } catch (error) {
      console.error('Error in markUserAsPaid:', error)
      throw error
    }
  }

  /**
   * Convenience method to increment trial petitions for the currently logged user
   * Gets the current user from Supabase auth and calls incrementTrialPetitions
   * @returns Promise<void>
   */
  async incrementCurrentUserTrialPetitions(): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Error getting current user:', authError)
        throw new Error('Erro ao obter usuário atual')
      }

      if (!user) {
        throw new Error('Usuário não está logado')
      }

      await this.incrementTrialPetitions(user.id)
    } catch (error) {
      console.error('Error in incrementCurrentUserTrialPetitions:', error)
      throw error
    }
  }

  /**
   * Convenience method to mark the currently logged user as paid
   * Gets the current user from Supabase auth and calls markUserAsPaid
   * @returns Promise<void>
   */
  async markCurrentUserAsPaid(): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Error getting current user:', authError)
        throw new Error('Erro ao obter usuário atual')
      }

      if (!user) {
        throw new Error('Usuário não está logado')
      }

      await this.markUserAsPaid(user.id)
    } catch (error) {
      console.error('Error in markCurrentUserAsPaid:', error)
      throw error
    }
  }
}

// Export a singleton instance
export const userActionsService = new UserActionsService()

// Export the class for potential custom instantiation
export { UserActionsService }