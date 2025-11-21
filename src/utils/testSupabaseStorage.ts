import { supabase } from '@/lib/supabaseClient'
export async function testSupabaseStorage() {
  console.log('🧪 Testing Supabase Storage Connection...');
  
  try {
    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('📦 Buckets:', { buckets, bucketsError });

    // Test 2: Check avatars bucket specifically
    if (buckets) {
      const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
      console.log('👤 Avatars bucket:', avatarsBucket);

      if (avatarsBucket) {
        // Test 3: List files in avatars bucket
        const { data: files, error: filesError } = await supabase.storage
          .from('avatars')
          .list('', { limit: 10 });
        console.log('📁 Files in avatars bucket:', { files, filesError });
      } else {
        // Create avatars bucket if it doesn't exist
        console.log('🔧 Creating avatars bucket...');
        const { data: createData, error: createError } = await supabase.storage
          .createBucket('avatars', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
            fileSizeLimit: 2097152 // 2MB
          });
        console.log('✨ Bucket creation result:', { createData, createError });
      }
    }

    // Test 4: Test public URL generation
    const testUrl = supabase.storage
      .from('avatars')
      .getPublicUrl('test-file.jpg');
    console.log('🔗 Test public URL:', testUrl);

    return { success: true, buckets };
  } catch (error) {
    console.error('❌ Supabase storage test failed:', error);
    return { success: false, error };
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testSupabaseStorage();
}