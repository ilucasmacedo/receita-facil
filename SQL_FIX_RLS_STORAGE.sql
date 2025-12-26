-- ================================================
-- CORRIGIR POLÍTICAS DE SEGURANÇA - STORAGE
-- ================================================
-- Execute este SQL no Supabase SQL Editor

-- PASSO 1: Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários podem fazer upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Fotos são públicas para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar suas fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar suas fotos" ON storage.objects;

-- PASSO 2: Criar políticas SIMPLES e FUNCIONAIS

-- Política 1: UPLOAD (INSERT) - Apenas usuários autenticados
CREATE POLICY "Permitir upload para usuários autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receitas-fotos');

-- Política 2: LEITURA (SELECT) - Público (para exibir as imagens)
CREATE POLICY "Permitir leitura pública"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'receitas-fotos');

-- Política 3: ATUALIZAÇÃO (UPDATE) - Apenas usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'receitas-fotos')
WITH CHECK (bucket_id = 'receitas-fotos');

-- Política 4: EXCLUSÃO (DELETE) - Apenas usuários autenticados
CREATE POLICY "Permitir exclusão para usuários autenticados"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'receitas-fotos');

-- ================================================
-- VERIFICAÇÃO
-- ================================================
-- Verificar se as políticas foram criadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%receitas-fotos%'
ORDER BY policyname;

-- ✅ PRONTO! Agora o upload deve funcionar!

