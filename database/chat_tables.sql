-- Chat Messages Table
CREATE TABLE IF NOT EXISTS app_2d8133c678_chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id varchar NOT NULL,
  sender_id varchar NOT NULL,
  sender_role varchar NOT NULL CHECK (sender_role IN ('client', 'writer')),
  sender_name varchar NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_petition_id ON app_2d8133c678_chat_messages(petition_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON app_2d8133c678_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON app_2d8133c678_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON app_2d8133c678_chat_messages(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE app_2d8133c678_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat messages
-- Allow users to read messages from petitions they are involved in
CREATE POLICY "allow_read_own_petition_messages" ON app_2d8133c678_chat_messages
FOR SELECT USING (
  -- Allow if sender is the current user
  sender_id = auth.uid()::varchar
  OR
  -- Allow if user is client of the petition
  petition_id IN (
    SELECT id FROM app_2d8133c678_petitions 
    WHERE client_id = auth.uid()::varchar
  )
  OR
  -- Allow if user is assigned writer of the petition
  petition_id IN (
    SELECT id FROM app_2d8133c678_petitions 
    WHERE assigned_writer_id = auth.uid()::varchar
  )
);

-- Allow users to insert messages for petitions they are involved in
CREATE POLICY "allow_insert_own_petition_messages" ON app_2d8133c678_chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid()::varchar
  AND
  (
    -- Allow if user is client of the petition
    petition_id IN (
      SELECT id FROM app_2d8133c678_petitions 
      WHERE client_id = auth.uid()::varchar
    )
    OR
    -- Allow if user is assigned writer of the petition
    petition_id IN (
      SELECT id FROM app_2d8133c678_petitions 
      WHERE assigned_writer_id = auth.uid()::varchar
    )
  )
);

-- Allow users to update read status of messages they can read
CREATE POLICY "allow_update_message_read_status" ON app_2d8133c678_chat_messages
FOR UPDATE USING (
  -- Allow if user is client of the petition
  petition_id IN (
    SELECT id FROM app_2d8133c678_petitions 
    WHERE client_id = auth.uid()::varchar
  )
  OR
  -- Allow if user is assigned writer of the petition
  petition_id IN (
    SELECT id FROM app_2d8133c678_petitions 
    WHERE assigned_writer_id = auth.uid()::varchar
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON app_2d8133c678_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (if needed)
-- These would typically be handled by Supabase automatically, but included for completeness
-- GRANT ALL ON app_2d8133c678_chat_messages TO authenticated;
-- GRANT ALL ON app_2d8133c678_chat_messages TO service_role;

-- Create a view for easier querying of chat conversations
CREATE OR REPLACE VIEW app_2d8133c678_chat_conversations AS
SELECT 
  p.id as petition_id,
  p.title as petition_title,
  p.client_id,
  p.client_name,
  p.assigned_writer_id as writer_id,
  p.status as petition_status,
  (
    SELECT json_build_object(
      'id', cm.id,
      'message', cm.message,
      'sender_name', cm.sender_name,
      'sender_role', cm.sender_role,
      'created_at', cm.created_at
    )
    FROM app_2d8133c678_chat_messages cm
    WHERE cm.petition_id = p.id
    ORDER BY cm.created_at DESC
    LIMIT 1
  ) as last_message,
  (
    SELECT COUNT(*)
    FROM app_2d8133c678_chat_messages cm
    WHERE cm.petition_id = p.id 
    AND cm.is_read = false
  ) as total_unread_count
FROM app_2d8133c678_petitions p
WHERE p.status != 'available'
ORDER BY 
  (
    SELECT cm.created_at
    FROM app_2d8133c678_chat_messages cm
    WHERE cm.petition_id = p.id
    ORDER BY cm.created_at DESC
    LIMIT 1
  ) DESC NULLS LAST;