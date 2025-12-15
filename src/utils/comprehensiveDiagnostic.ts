import { supabase } from '@/lib/supabaseClient'
import { createAvatarsBucketIfNeeded, testBucketUpload } from '@/utils/createAvatarsBucket';

export interface DiagnosticResult {
  supabaseConnection: boolean;
  avatarsBucketExists: boolean;
  bucketUploadTest: boolean;
  storagePermissions: boolean;
  overall: boolean;
}

export const runComprehensiveDiagnostic = async (): Promise<DiagnosticResult> => {
  console.log('🔬 COMPREHENSIVE DIAGNOSTIC - Starting system health check...');
  
  const result: DiagnosticResult = {
    supabaseConnection: false,
    avatarsBucketExists: false,
    bucketUploadTest: false,
    storagePermissions: false,
    overall: false
  };

  try {
    // Test 1: Supabase Connection
    console.log('🔌 Test 1: Checking Supabase connection...');
    try {
      const { data, error } = await supabase.from('app_2d8133c678_profiles').select('user_id').limit(1);
      if (error) {
        console.error('❌ Supabase connection failed:', error);
      } else {
        console.log('✅ Supabase connection successful');
        result.supabaseConnection = true;
      }
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
    }

    // Test 2: Storage Bucket Creation
    console.log('🪣 Test 2: Ensuring avatars bucket exists...');
    try {
      const bucketExists = await createAvatarsBucketIfNeeded();
      result.avatarsBucketExists = bucketExists;
      if (bucketExists) {
        console.log('✅ Avatars bucket exists/created');
      } else {
        console.error('❌ Failed to create/verify avatars bucket');
      }
    } catch (error) {
      console.error('❌ Bucket creation error:', error);
    }

    // Test 3: Upload Test
    console.log('📤 Test 3: Testing bucket upload functionality...');
    try {
      if (result.avatarsBucketExists) {
        const uploadTest = await testBucketUpload();
        result.bucketUploadTest = uploadTest;
        if (uploadTest) {
          console.log('✅ Bucket upload test passed');
        } else {
          console.error('❌ Bucket upload test failed');
        }
      } else {
        console.log('⏭️ Skipping upload test - bucket not available');
      }
    } catch (error) {
      console.error('❌ Upload test error:', error);
    }

    // Test 4: Storage Permissions
    console.log('🔐 Test 4: Checking storage permissions...');
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('❌ Cannot list buckets:', error);
      } else {
        console.log('✅ Storage permissions OK');
        result.storagePermissions = true;
      }
    } catch (error) {
      console.error('❌ Storage permissions error:', error);
    }

    // Overall Result
    result.overall = result.supabaseConnection && result.avatarsBucketExists && result.bucketUploadTest && result.storagePermissions;

    console.log('📋 DIAGNOSTIC COMPLETE:');
    console.log('  ✓ Supabase Connection:', result.supabaseConnection ? '✅' : '❌');
    console.log('  ✓ Avatars Bucket:', result.avatarsBucketExists ? '✅' : '❌');
    console.log('  ✓ Upload Test:', result.bucketUploadTest ? '✅' : '❌');
    console.log('  ✓ Storage Permissions:', result.storagePermissions ? '✅' : '❌');
    console.log('  🎯 OVERALL:', result.overall ? '✅ READY' : '❌ NEEDS FIXING');

    return result;
  } catch (error) {
    console.error('❌ CRITICAL DIAGNOSTIC ERROR:', error);
    return result;
  }
};