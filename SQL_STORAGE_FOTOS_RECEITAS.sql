-- ================================================
-- CONFIGURAR STORAGE PARA FOTOS DE RECEITAS
-- ================================================
-- Execute estes comandos no Supabase Dashboard

-- ================================================
-- PASSO 1: Criar Bucket (via Dashboard)
-- ================================================
-- Vá para: Storage → Create a new bucket
-- Nome: receitas-fotos
-- Public: SIM (para poder exibir as imagens)

-- ================================================
-- PASSO 2: Configurar Políticas de Segurança (RLS)
-- ================================================

-- Política: Permitir upload apenas para usuários autenticados
CREATE POLICY "Usuários podem fazer upload de fotos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receitas-fotos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Permitir leitura pública (para exibir as imagens)
CREATE POLICY "Fotos são públicas para leitura"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'receitas-fotos');

-- Política: Permitir atualização apenas do próprio usuário
CREATE POLICY "Usuários podem atualizar suas fotos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'receitas-fotos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'receitas-fotos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Permitir exclusão apenas do próprio usuário
CREATE POLICY "Usuários podem deletar suas fotos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'receitas-fotos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- PASSO 3: Configurar Limites de Tamanho
-- ================================================
-- No Dashboard do Supabase:
-- Storage → receitas-fotos → Settings
-- File size limit: 5 MB (padrão é 50MB)
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- ================================================
-- VERIFICAÇÃO
-- ================================================
-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE name = 'receitas-fotos';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ================================================
-- ESTRUTURA DE PASTAS
-- ================================================
-- Organização: receitas-fotos/{user_id}/{receita_id}.jpg
-- Exemplo: receitas-fotos/123e4567-e89b-12d3-a456-426614174000/receita-001.jpg

-- ================================================
-- NOTAS IMPORTANTES
-- ================================================
-- 1. O bucket DEVE ser público para exibir as imagens
-- 2. RLS garante que só o dono pode fazer upload/deletar
-- 3. As imagens serão redimensionadas no client antes do upload
-- 4. Formato final: JPEG otimizado (400x400px, 80% qualidade)
-- 5. URL pública: https://{project}.supabase.co/storage/v1/object/public/receitas-fotos/{user_id}/{filename}

-- ✅ PRONTO! Agora configure o bucket no Dashboard e depois execute as políticas acima

