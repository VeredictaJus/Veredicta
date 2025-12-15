import { supabase } from './supabase';

export async function uploadFileToSupabase(file: File): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('chat-uploads')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from('chat-uploads')
    .getPublicUrl(filePath);

  return {
    success: true,
    url: publicUrlData.publicUrl,
  };
}
