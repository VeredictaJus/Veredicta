import { supabase } from '@/lib/supabaseClient';

export interface FileUploadResult {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  error?: string;
}

export interface PetitionFile {
  id: string;
  petition_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export class PetitionFileService {
  private static readonly BUCKET_NAME = 'petition_files';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  /**
   * Upload a file to Supabase Storage and save metadata to database
   */
  static async uploadFile(
    file: File,
    petitionId: string,
    userId: string
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${petitionId}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: `Erro no upload: ${uploadError.message}` };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // Save metadata to database
      const { data: dbData, error: dbError } = await supabase
        .from('petition_files')
        .insert({
          petition_id: petitionId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Try to clean up uploaded file
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        return { success: false, error: `Erro ao salvar metadados: ${dbError.message}` };
      }

      return {
        success: true,
        fileId: dbData.id,
        fileUrl: urlData.publicUrl,
      };

    } catch (error) {
      console.error('Unexpected error:', error);
      return { 
        success: false, 
        error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      };
    }
  }

  /**
   * Get all files for a petition
   */
  static async getPetitionFiles(petitionId: string): Promise<PetitionFile[]> {
    try {
      const { data, error } = await supabase
        .from('petition_files')
        .select('*')
        .eq('petition_id', petitionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching petition files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching files:', error);
      return [];
    }
  }

  /**
   * Delete a file from storage and database
   */
  static async deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get file metadata
      const { data: fileData, error: fetchError } = await supabase
        .from('petition_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fetchError) {
        return { success: false, error: `Erro ao buscar arquivo: ${fetchError.message}` };
      }

      // Extract file path from URL
      const filePath = this.extractFilePathFromUrl(fileData.file_url);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('petition_files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        return { success: false, error: `Erro ao deletar metadados: ${dbError.message}` };
      }

      return { success: true };

    } catch (error) {
      console.error('Unexpected error deleting file:', error);
      return { 
        success: false, 
        error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      };
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `Arquivo muito grande. Máximo permitido: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB` 
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Tipo de arquivo não permitido. Use PDF, Word ou imagens.' 
      };
    }

    return { valid: true };
  }

  /**
   * Extract file path from Supabase Storage URL
   */
  private static extractFilePathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === this.BUCKET_NAME);
      
      if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }
      
      // Fallback: try to extract from the end of the URL
      const lastSlashIndex = url.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        return url.substring(lastSlashIndex + 1);
      }
      
      return url;
    } catch (error) {
      console.error('Error extracting file path:', error);
      return url;
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon based on file type
   */
  static getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  }
}
