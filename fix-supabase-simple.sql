-- Simple fix for create_support_conversation function
-- Drop and recreate with proper SECURITY DEFINER

-- Drop existing function and triggers
DROP FUNCTION IF EXISTS public.create_support_conversation() CASCADE;

-- Create the main function
CREATE OR REPLACE FUNCTION public.create_support_conversation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger function
CREATE OR REPLACE FUNCTION public.create_support_conversation_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conversation_id uuid;
BEGIN
    SELECT public.create_support_conversation() INTO conversation_id;
    RETURN NEW;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_support_conversation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_support_conversation_trigger() TO authenticated;

-- Create triggers
CREATE TRIGGER add_support_conversation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_support_conversation_trigger();

CREATE TRIGGER trg_create_support_conversation
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_support_conversation_trigger();

-- Verify
SELECT 'Function created successfully' as status;



