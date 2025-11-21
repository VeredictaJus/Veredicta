-- Setup Petition Files Storage System
-- This script creates the bucket and table for storing petition support files

-- 1. Create petition_files bucket in Supabase Storage
-- Note: This needs to be done manually in Supabase Dashboard > Storage
-- Bucket name: petition_files
-- Public: false (private bucket)
-- File size limit: 10485760 (10MB)
-- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, image/png, image/gif, image/webp

-- 2. Create petition_files table for metadata
CREATE TABLE IF NOT EXISTS petition_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id uuid NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  file_name varchar NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL,
  file_type varchar NOT NULL,
  uploaded_by text NOT NULL, -- Firebase UID of the user who uploaded
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_petition_files_petition_id ON petition_files(petition_id);
CREATE INDEX IF NOT EXISTS idx_petition_files_uploaded_by ON petition_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_petition_files_created_at ON petition_files(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE petition_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "allow_clients_read_own_petition_files" ON petition_files;
DROP POLICY IF EXISTS "allow_clients_insert_own_petition_files" ON petition_files;
DROP POLICY IF EXISTS "allow_clients_update_own_petition_files" ON petition_files;
DROP POLICY IF EXISTS "allow_clients_delete_own_petition_files" ON petition_files;
DROP POLICY IF EXISTS "allow_writers_read_assigned_petition_files" ON petition_files;
DROP POLICY IF EXISTS "allow_writers_update_assigned_petition_files" ON petition_files;

-- RLS Policies for petition_files
-- Allow clients to read files from their own petitions
CREATE POLICY "allow_clients_read_own_petition_files" ON petition_files
FOR SELECT USING (
  petition_id IN (
    SELECT id FROM petitions WHERE client_id = auth.uid()::text
  )
);

-- Allow clients to insert files to their own petitions
CREATE POLICY "allow_clients_insert_own_petition_files" ON petition_files
FOR INSERT WITH CHECK (
  petition_id IN (
    SELECT id FROM petitions WHERE client_id = auth.uid()::text
  ) AND uploaded_by = auth.uid()::text
);

-- Allow clients to update files from their own petitions
CREATE POLICY "allow_clients_update_own_petition_files" ON petition_files
FOR UPDATE USING (
  petition_id IN (
    SELECT id FROM petitions WHERE client_id = auth.uid()::text
  )
);

-- Allow clients to delete files from their own petitions
CREATE POLICY "allow_clients_delete_own_petition_files" ON petition_files
FOR DELETE USING (
  petition_id IN (
    SELECT id FROM petitions WHERE client_id = auth.uid()::text
  )
);

-- Allow writers to read files from petitions assigned to them
CREATE POLICY "allow_writers_read_assigned_petition_files" ON petition_files
FOR SELECT USING (
  petition_id IN (
    SELECT id FROM petitions WHERE assigned_writer_id = auth.uid()::text
  )
);

-- Allow writers to update files from petitions assigned to them
CREATE POLICY "allow_writers_update_assigned_petition_files" ON petition_files
FOR UPDATE USING (
  petition_id IN (
    SELECT id FROM petitions WHERE assigned_writer_id = auth.uid()::text
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_petition_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_petition_files_updated_at
  BEFORE UPDATE ON petition_files
  FOR EACH ROW
  EXECUTE FUNCTION update_petition_files_updated_at();

-- Grant necessary permissions
GRANT ALL ON petition_files TO authenticated;
GRANT ALL ON petition_files TO service_role;

-- Storage policies for petition_files bucket
-- Note: These need to be set up in Supabase Dashboard > Storage > petition_files bucket > Policies

-- Policy 1: Allow authenticated users to upload files
-- Policy name: "Allow authenticated users to upload files"
-- Policy definition:
-- (bucket_id = 'petition_files'::text) AND (auth.role() = 'authenticated'::text)

-- Policy 2: Allow users to read files from their own petitions
-- Policy name: "Allow users to read their own petition files"
-- Policy definition:
-- (bucket_id = 'petition_files'::text) AND (
--   EXISTS (
--     SELECT 1 FROM petition_files pf
--     JOIN petitions p ON pf.petition_id = p.id
--     WHERE pf.file_url = (storage.foldername(name))[1] || '/' || (storage.filename(name))
--     AND (p.client_id = auth.uid()::text OR p.assigned_writer_id = auth.uid()::text)
--   )
-- )

-- Policy 3: Allow users to delete files from their own petitions
-- Policy name: "Allow users to delete their own petition files"
-- Policy definition:
-- (bucket_id = 'petition_files'::text) AND (
--   EXISTS (
--     SELECT 1 FROM petition_files pf
--     JOIN petitions p ON pf.petition_id = p.id
--     WHERE pf.file_url = (storage.foldername(name))[1] || '/' || (storage.filename(name))
--     AND p.client_id = auth.uid()::text
--   )
-- )
