-- Add RLS policies to petitions table (RUN AFTER CREATING THE TABLE)

-- Enable Row Level Security (RLS)
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "allow_clients_read_own_petitions" ON petitions;
DROP POLICY IF EXISTS "allow_clients_insert_own_petitions" ON petitions;
DROP POLICY IF EXISTS "allow_clients_update_own_petitions" ON petitions;
DROP POLICY IF EXISTS "allow_writers_read_assigned_petitions" ON petitions;
DROP POLICY IF EXISTS "allow_writers_update_assigned_petitions" ON petitions;
DROP POLICY IF EXISTS "allow_admins_read_all_petitions" ON petitions;
DROP POLICY IF EXISTS "allow_admins_update_all_petitions" ON petitions;

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

-- Allow admins to read all petitions
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




























