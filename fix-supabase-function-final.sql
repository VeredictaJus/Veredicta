-- Fix create_support_conversation function properly
-- Create separate functions for trigger and direct call

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

-- Create the main function that returns UUID (for direct calls)
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

-- Create a trigger function that calls the main function
CREATE OR REPLACE FUNCTION public.create_support_conversation_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conversation_id uuid;
BEGIN
    -- Call the main function to create conversation
    SELECT public.create_support_conversation() INTO conversation_id;
    
    -- Return the trigger record (unchanged)
    RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_support_conversation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_support_conversation_trigger() TO authenticated;

-- Recreate the trigger on auth.users table using the trigger function
CREATE OR REPLACE TRIGGER add_support_conversation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_support_conversation_trigger();

-- Recreate the trigger on users table using the trigger function
CREATE OR REPLACE TRIGGER trg_create_support_conversation
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_support_conversation_trigger();

-- Verify everything was created correctly
SELECT 
    routine_name,
    security_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('create_support_conversation', 'create_support_conversation_trigger')
  AND routine_schema = 'public'
ORDER BY routine_name;

-- Verify triggers were recreated
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name IN ('add_support_conversation', 'trg_create_support_conversation')
ORDER BY trigger_name;



