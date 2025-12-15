import { supabase } from '@/lib/supabaseClient'

export const setupStorageBucket = async (): Promise<boolean> => {
  console.log('🔧 STORAGE SETUP - Setting up avatars bucket with policies...');

  try {
    // Step 1: Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Failed to list buckets:', listError);
      return false;
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucket) {
      // Create bucket
      console.log('📦 Creating avatars bucket...');
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 2097152 // 2MB
      });

      if (createError) {
        console.error('❌ Failed to create bucket:', createError);
        return false;
      }
      
      console.log('✅ Avatars bucket created successfully');
    } else {
      console.log('✅ Avatars bucket already exists');
    }

    return true;
  } catch (error) {
    console.error('❌ Storage setup error:', error);
    return false;
  }
};

export const ensureAvatarsStorage = setupStorageBucket;