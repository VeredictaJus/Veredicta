-- Deletar a petição problemática com caractere NULL

DELETE FROM public.petitions 
WHERE id = '245921a8-8707-4d55-b559-527bc33edd9b';

-- Verificar se foi deletada
SELECT COUNT(*) as total_petitions FROM public.petitions;

















