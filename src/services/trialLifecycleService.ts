import { supabase } from '@/lib/supabaseClient';

export type TrialFlags = {
  isTrial: boolean;
  trialPetitionUsed: boolean;
  regularizationRequired: boolean;
  hasLifecycleColumns: boolean;
};

function hasKey(obj: Record<string, any> | null | undefined, key: string) {
  return Boolean(obj && Object.prototype.hasOwnProperty.call(obj, key));
}

async function getProfileRow(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('firebase_uid', userId)
    .maybeSingle();

  if (error) throw error;
  return (data || null) as Record<string, any> | null;
}

async function updateKnownProfileFields(userId: string, values: Record<string, any>) {
  const profile = await getProfileRow(userId);
  if (!profile) return false;

  const patch: Record<string, any> = {};
  for (const [key, value] of Object.entries(values)) {
    if (hasKey(profile, key)) patch[key] = value;
  }
  if (Object.keys(patch).length === 0) return false;

  const { error } = await supabase
    .from('user_profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('firebase_uid', userId);

  if (error) throw error;
  return true;
}

export class TrialLifecycleService {
  static async getTrialFlags(userId: string): Promise<TrialFlags> {
    try {
      const profile = await getProfileRow(userId);
      if (!profile) {
        return {
          isTrial: false,
          trialPetitionUsed: false,
          regularizationRequired: false,
          hasLifecycleColumns: false,
        };
      }

      const hasLifecycleColumns =
        hasKey(profile, 'is_trial') ||
        hasKey(profile, 'trial_petition_used') ||
        hasKey(profile, 'regularization_required');

      const isTrial = hasKey(profile, 'is_trial') ? Boolean(profile.is_trial) : false;
      const trialPetitionUsed = hasKey(profile, 'trial_petition_used')
        ? Boolean(profile.trial_petition_used)
        : false;
      const regularizationRequired = hasKey(profile, 'regularization_required')
        ? Boolean(profile.regularization_required)
        : false;

      return { isTrial, trialPetitionUsed, regularizationRequired, hasLifecycleColumns };
    } catch {
      return {
        isTrial: false,
        trialPetitionUsed: false,
        regularizationRequired: false,
        hasLifecycleColumns: false,
      };
    }
  }

  static async markTrialPetitionUsed(userId: string) {
    return updateKnownProfileFields(userId, {
      trial_petition_used: true,
      trial_petition_used_at: new Date().toISOString(),
    });
  }

  static async markRegularizationRequired(userId: string) {
    return updateKnownProfileFields(userId, {
      regularization_required: true,
      trial_completed_at: new Date().toISOString(),
    });
  }

  static async clearRegularizationRequirement(userId: string) {
    return updateKnownProfileFields(userId, {
      regularization_required: false,
      regularized_at: new Date().toISOString(),
      is_trial: false,
    });
  }
}

