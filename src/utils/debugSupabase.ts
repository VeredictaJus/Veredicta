import { supabase } from '@/lib/supabaseClient'

// Debug function to test Supabase connectivity
export const debugSupabaseConnection = async () => {
  console.log('🔍 SUPABASE DEBUG - Starting connectivity test...');
  
  try {
    // Test 1: Check if supabase client is initialized
    console.log('🧪 Test 1: Supabase client check');
    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      return false;
    }
    console.log('✅ Supabase client exists');
    
    // Test 2: List buckets
    console.log('🧪 Test 2: List storage buckets');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
      return false;
    }
    
    console.log('✅ Buckets retrieved:', buckets?.map(b => ({ name: b.name, public: b.public })));
    
    // Test 3: Check avatars bucket specifically
    const avatarsBucket = buckets?.find(b => b.name === 'avatars');
    if (avatarsBucket) {
      console.log('✅ Avatars bucket exists:', avatarsBucket);
    } else {
      console.log('⚠️ Avatars bucket does not exist, will need to create');
    }
    
    // Test 4: Try a simple file list (should work even if bucket is empty)
    try {
      console.log('🧪 Test 4: List files in avatars bucket');
      const { data: files, error: filesError } = await supabase.storage
        .from('avatars')
        .list('', { limit: 1 });
        
      if (filesError) {
        console.error('⚠️ Could not list files (bucket might not exist):', filesError);
      } else {
        console.log('✅ Successfully accessed avatars bucket, file count:', files?.length || 0);
      }
    } catch (listError) {
      console.error('⚠️ Error accessing bucket:', listError);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ SUPABASE DEBUG - Connection test failed:', error);
    return false;
  }
};

// Function to test file upload with a small test file
export const testSupabaseUpload = async () => {
  console.log('🧪 SUPABASE UPLOAD TEST - Starting...');
  
  try {
    // Create a small test file
    const testContent = 'test';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    
    console.log('📁 Created test file:', testFile);
    
    // Try to upload
    const fileName = `test-${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, testFile);
      
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      return false;
    }
    
    console.log('✅ Test upload successful:', uploadData);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    console.log('🌐 Test file public URL:', publicUrl);
    
    // Clean up test file
    await supabase.storage.from('avatars').remove([fileName]);
    console.log('🧹 Test file cleaned up');
    
    return true;
    
  } catch (error) {
    console.error('❌ SUPABASE UPLOAD TEST - Failed:', error);
    return false;
  }
};