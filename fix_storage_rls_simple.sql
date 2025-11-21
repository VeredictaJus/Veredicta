-- Política SIMPLES para permitir upload de petições de redatores
-- Esta política usa Firebase UID diretamente sem precisar de autenticação Supabase

-- Remover política antiga
DROP POLICY IF EXISTS "Allow authenticated writers to upload petitions" ON storage.objects;

-- Criar política que permite upload baseado no Firebase UID no nome do arquivo
CREATE POLICY "Allow writers to upload petitions by firebase uid" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'writer-petitions' AND
  (
    -- Extrair Firebase UID do nome do arquivo (formato: UID/timestamp-key-name.pdf)
    (string_to_array(name, '/'))[1] IN (
      SELECT firebase_uid FROM user_profiles 
      WHERE role = 'writer' 
      AND firebase_uid IS NOT NULL
    )
  )
);

-- Política para visualizar petições próprias
DROP POLICY IF EXISTS "Writers can view their own petitions" ON storage.objects;

CREATE POLICY "Writers can view their own petitions by uid" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  (
    (string_to_array(name, '/'))[1] IN (
      SELECT firebase_uid FROM user_profiles 
      WHERE firebase_uid IS NOT NULL
    )
  )
);

-- Política para admins verem todas as petições
DROP POLICY IF EXISTS "Admins can view all petitions" ON storage.objects;

CREATE POLICY "Admins can view all petitions" ON storage.objects
FOR SELECT USING (
  bucket_id = 'writer-petitions' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE firebase_uid = auth.uid()::text
    AND role = 'admin'
  )
);










