-- Create user_activity_logs table to fix registration error
-- Error: "relation 'public.user_activity_logs' does not exist"

BEGIN;

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type varchar(100) NOT NULL,
    activity_description text,
    ip_address inet,
    user_agent text,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON public.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs" ON public.user_activity_logs
FOR SELECT USING (
    (select auth.uid()) = user_id
);

-- Allow system to insert activity logs (for registration, login, etc.)
CREATE POLICY "Allow system insert activity logs" ON public.user_activity_logs
FOR INSERT WITH CHECK (
    (select auth.uid()) = user_id OR 
    auth.role() = 'service_role'
);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON public.user_activity_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.app_2d8133c678_profiles 
        WHERE user_id = (select auth.uid())::varchar 
        AND user_type = 'admin'
    )
);

-- Users can update their own logs (for marking as read, etc.)
CREATE POLICY "Users can update own activity logs" ON public.user_activity_logs
FOR UPDATE USING (
    (select auth.uid()) = user_id
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_activity_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_activity_logs_updated_at
    BEFORE UPDATE ON public.user_activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_user_activity_logs_updated_at();

-- Insert initial activity types for reference
INSERT INTO public.user_activity_logs (user_id, activity_type, activity_description, metadata) VALUES
-- These are just examples, the actual logs will be created by the system
(gen_random_uuid(), 'account_created', 'User account created successfully', '{"source": "registration_form", "user_type": "client"}'),
(gen_random_uuid(), 'login', 'User logged in', '{"source": "login_form", "success": true}'),
(gen_random_uuid(), 'profile_updated', 'User profile information updated', '{"fields_changed": ["full_name", "phone"]}'),
(gen_random_uuid(), 'password_changed', 'User password changed', '{"method": "user_initiated"}')
ON CONFLICT DO NOTHING;

-- Clean up example data (these were just for structure reference)
DELETE FROM public.user_activity_logs WHERE activity_description IN (
    'User account created successfully', 
    'User logged in', 
    'User profile information updated', 
    'User password changed'
);

-- Grant necessary permissions
GRANT ALL ON public.user_activity_logs TO authenticated;
GRANT ALL ON public.user_activity_logs TO service_role;

COMMIT;

-- Verify table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_activity_logs' 
ORDER BY ordinal_position;