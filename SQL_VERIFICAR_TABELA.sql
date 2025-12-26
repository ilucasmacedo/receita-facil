-- ============================================
-- VERIFICAR SE A TABELA ESTÁ FUNCIONANDO
-- Execute este SQL para testar
-- ============================================

-- 1. Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'ingredientes';

-- 2. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'ingredientes';

-- 3. Verificar políticas criadas
SELECT * FROM pg_policies 
WHERE tablename = 'ingredientes';

-- 4. Contar ingredientes (substitua pelo seu user_id)
SELECT COUNT(*) as total_ingredientes 
FROM ingredientes 
WHERE user_id = '3281f4db-9e06-4ad4-9f34-2f1c2913eebe';

-- 5. Ver ingredientes (substitua pelo seu user_id)
SELECT * FROM ingredientes 
WHERE user_id = '3281f4db-9e06-4ad4-9f34-2f1c2913eebe'
ORDER BY created_at DESC;

