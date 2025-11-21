-- Fix create_support_conversation function with CASCADE
-- This will drop the function and its dependent triggers, then recreate everything

-- First, let's see what triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('add_support_conversation', 'trg_create_support_conversation')
ORDER BY trigger_name;

-- Drop the function and all dependent objects (triggers)
DROP FUNCTION IF EXISTS public.create_support_conversation() CASCADE;

-- Recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_support_conversation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- This is the key fix!
AS $$
DECLARE
    conversation_id uuid;
BEGIN
    INSERT INTO public.conversations (id, created_at)
    VALUES (gen_random_uuid(), NOW())
    RETURNING id INTO conversation_id;
    
    RETURN conversation_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_support_conversation() TO authenticated;

-- Recreate the trigger on auth.users table
CREATE OR REPLACE TRIGGER add_support_conversation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_support_conversation();

-- Recreate the trigger on users table (if it exists)
CREATE OR REPLACE TRIGGER trg_create_support_conversation
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_support_conversation();

-- Verify everything was created correctly
SELECT 
    routine_name,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'create_support_conversation' 
  AND routine_schema = 'public';

-- Verify triggers were recreated
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name IN ('add_support_conversation', 'trg_create_support_conversation')
ORDER BY trigger_name;



