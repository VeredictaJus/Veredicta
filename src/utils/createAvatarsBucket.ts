import { supabase } from '@/lib/supabaseClient'

export const createAvatarsBucketIfNeeded = async (): Promise<boolean> => {
  console.log('🚀 BUCKET CREATION - Ensuring avatars bucket exists...');
  
  try {
    // Step 1: Check if bucket exists
    console.log('🔍 Step 1: Checking if avatars bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Failed to list buckets:', listError);
      throw new Error(`Cannot access storage: ${listError.message}`);
    }
    
    console.log('📋 Available buckets:', buckets?.map(b => b.name));
    
    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket already exists');
      return true;
    }
    
    // Step 2: Create bucket if it doesn't exist
    console.log('🔧 Step 2: Creating avatars bucket...');
    const { data: createData, error: createError } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 2097152 // 2MB
    });
    
    if (createError) {
      console.error('❌ Failed to create avatars bucket:', createError);
      throw new Error(`Cannot create bucket: ${createError.message}`);
    }
    
    console.log('✅ Avatars bucket created successfully:', createData);
    
    // Step 3: Verify bucket was created
    console.log('🧪 Step 3: Verifying bucket creation...');
    const { data: verifyBuckets, error: verifyError } = await supabase.storage.listBuckets();
    
    if (verifyError) {
      console.error('❌ Failed to verify bucket creation:', verifyError);
      return false;
    }
    
    const createdBucket = verifyBuckets?.find(bucket => bucket.name === 'avatars');
    if (!createdBucket) {
      console.error('❌ Bucket creation verification failed');
      return false;
    }
    
    console.log('✅ Bucket creation verified successfully');
    return true;
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in bucket creation:', error);
    return false;
  }
};

export const testBucketUpload = async (): Promise<boolean> => {
  console.log('🧪 BUCKET TEST - Testing upload to avatars bucket...');
  
  try {
    // Create test file
    const testContent = `test-${Date.now()}`;
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'bucket-test.txt', { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    // Test upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testFile);
      
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      return false;
    }
    
    console.log('✅ Test upload successful:', uploadData);
    
    // Test public URL generation
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(testFileName);
      
    console.log('🌐 Generated test URL:', publicUrl);
    
    if (!publicUrl.includes('supabase.co')) {
      console.error('❌ Invalid public URL format');
      return false;
    }
    
    // Clean up test file
    await supabase.storage.from('avatars').remove([testFileName]);
    console.log('🧹 Test file cleaned up');
    
    console.log('🎉 Bucket test completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Bucket test failed:', error);
    return false;
  }
};