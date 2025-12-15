-- Create petitions table (CORRECTED VERSION)
CREATE TABLE IF NOT EXISTS petitions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  title varchar NOT NULL,
  description text,
  type varchar,
  status varchar DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'revision', 'completed', 'rejected')),
  priority varchar DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'express')),
  price decimal(10,2) DEFAULT 0,
  deadline timestamp with time zone,
  writer_name varchar,
  assigned_writer_id uuid,
  files text[], -- Array of file URLs/paths
  correction_count integer DEFAULT 0,
  correction_requested_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_petitions_client_id ON petitions(client_id);
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_created_at ON petitions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petitions_assigned_writer_id ON petitions(assigned_writer_id);

-- Enable Row Level Security (RLS)
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for petitions
-- Allow clients to read their own petitions
CREATE POLICY "allow_clients_read_own_petitions" ON petitions
FOR SELECT USING (client_id = auth.uid());

-- Allow clients to insert their own petitions
CREATE POLICY "allow_clients_insert_own_petitions" ON petitions
FOR INSERT WITH CHECK (client_id = auth.uid());

-- Allow clients to update their own petitions
CREATE POLICY "allow_clients_update_own_petitions" ON petitions
FOR UPDATE USING (client_id = auth.uid());

-- Allow writers to read petitions assigned to them
CREATE POLICY "allow_writers_read_assigned_petitions" ON petitions
FOR SELECT USING (assigned_writer_id = auth.uid());

-- Allow writers to update petitions assigned to them
CREATE POLICY "allow_writers_update_assigned_petitions" ON petitions
FOR UPDATE USING (assigned_writer_id = auth.uid());

-- Allow admins to read all petitions (assuming admin role exists)
CREATE POLICY "allow_admins_read_all_petitions" ON petitions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admins to update all petitions
CREATE POLICY "allow_admins_update_all_petitions" ON petitions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles_v2 
    WHERE firebase_uid = auth.uid() 
    AND role = 'admin'
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_petitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_petitions_updated_at
  BEFORE UPDATE ON petitions
  FOR EACH ROW
  EXECUTE FUNCTION update_petitions_updated_at();

-- Grant necessary permissions
GRANT ALL ON petitions TO authenticated;
GRANT ALL ON petitions TO service_role;




























