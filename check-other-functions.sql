-- Check for other functions that might have permission issues
-- Look for functions that use SECURITY INVOKER (default) and might need SECURITY DEFINER

SELECT 
    routine_name,
    routine_schema,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND security_type = 'INVOKER'
  AND (
    routine_definition ILIKE '%INSERT INTO%' OR
    routine_definition ILIKE '%UPDATE%' OR
    routine_definition ILIKE '%DELETE FROM%' OR
    routine_definition ILIKE '%CREATE%' OR
    routine_definition ILIKE '%DROP%'
  )
ORDER BY routine_name;

-- Also check for any triggers that might be calling functions
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;



