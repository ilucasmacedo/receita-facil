-- ============================================
-- CORRIGIR SCHEMA CACHE DO SUPABASE
-- Execute este SQL no SQL Editor
-- ============================================

-- 1. Remover a tabela se existir (para recriar do zero)
DROP TABLE IF EXISTS ingredientes CASCADE;

-- 2. Recriar a tabela
CREATE TABLE ingredientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_total DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas (remover antigas primeiro)
DROP POLICY IF EXISTS "Users can view own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can insert own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can update own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can delete own ingredientes" ON ingredientes;

CREATE POLICY "Users can view own ingredientes" 
  ON ingredientes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredientes" 
  ON ingredientes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ingredientes" 
  ON ingredientes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredientes" 
  ON ingredientes FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Forçar atualização do schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================
-- AGUARDE 10-15 SEGUNDOS após executar
-- Depois recarregue a página de diagnóstico
-- ============================================

