-- ============================================
-- CRIAR TABELA DE INGREDIENTES
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- 1. Criar a tabela ingredientes
CREATE TABLE IF NOT EXISTS ingredientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_total DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can insert own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can update own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can delete own ingredientes" ON ingredientes;

-- 4. Criar políticas de segurança
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

-- ============================================
-- PRONTO! Agora você pode salvar ingredientes
-- ============================================

