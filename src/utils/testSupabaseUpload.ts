import { supabase } from '@/lib/supabaseClient'

// Standalone test to verify Supabase upload functionality
export const testSupabaseUploadStandalone = async (): Promise<boolean> => {
  console.log('🧪 STANDALONE TEST - Testing Supabase upload system...');
  
  try {
    // Test 1: Check if supabase client is initialized
    console.log('Test 1: Verifying Supabase client initialization');
    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      return false;
    }
    console.log('✅ Supabase client exists');
    
    // Test 2: Check environment variables
    console.log('Test 2: Checking Supabase configuration');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Supabase URL exists:', !!supabaseUrl);
    console.log('Supabase Key exists:', !!supabaseAnonKey);
    console.log('URL starts with https:', supabaseUrl?.startsWith('https://'));
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables');
      return false;
    }
    
    // Test 3: Test basic connectivity
    console.log('Test 3: Testing Supabase connectivity');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to connect to Supabase storage:', bucketsError);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase storage');
    console.log('Available buckets:', buckets?.map(b => b.name));
    
    // Test 4: Ensure avatars bucket exists
    console.log('Test 4: Checking avatars bucket');
    const avatarsBucket = buckets?.find(b => b.name === 'avatars');
    
    if (!avatarsBucket) {
      console.log('Creating avatars bucket...');
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        fileSizeLimit: 2097152 // 2MB
      });
      
      if (createError) {
        console.error('❌ Failed to create avatars bucket:', createError);
        return false;
      }
      console.log('✅ Avatars bucket created successfully');
    } else {
      console.log('✅ Avatars bucket already exists');
    }
    
    // Test 5: Test actual upload with small file
    console.log('Test 5: Testing file upload');
    const testContent = 'test-upload-content';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testFile);
      
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      return false;
    }
    
    console.log('✅ Test upload successful:', uploadData);
    
    // Test 6: Verify public URL generation
    console.log('Test 6: Testing public URL generation');
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(testFileName);
      
    console.log('Generated public URL:', publicUrl);
    
    if (!publicUrl.startsWith('https://') || !publicUrl.includes('supabase.co')) {
      console.error('❌ Invalid public URL format:', publicUrl);
      return false;
    }
    
    console.log('✅ Valid public URL generated');
    
    // Clean up test file
    await supabase.storage.from('avatars').remove([testFileName]);
    console.log('🧹 Test file cleaned up');
    
    console.log('🎉 ALL TESTS PASSED - Supabase upload system is working correctly');
    return true;
    
  } catch (error) {
    console.error('❌ STANDALONE TEST FAILED:', error);
    return false;
  }
};

// Function to be called from browser console for manual testing
(window as any).testSupabaseUpload = testSupabaseUploadStandalone;