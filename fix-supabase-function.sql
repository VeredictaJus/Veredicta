-- Fix create_support_conversation function permissions
-- Based on Supabase Support recommendation

-- First, let's check if the function exists and its current definition
SELECT 
    routine_name,
    routine_definition,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'create_support_conversation' 
  AND routine_schema = 'public';

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.create_support_conversation();

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

-- Verify the function was created correctly
SELECT 
    routine_name,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_support_conversation' 
  AND routine_schema = 'public';



