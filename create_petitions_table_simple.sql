-- Create petitions table (SIMPLE VERSION - NO RLS POLICIES FIRST)
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

-- Grant necessary permissions
GRANT ALL ON petitions TO authenticated;
GRANT ALL ON petitions TO service_role;




























