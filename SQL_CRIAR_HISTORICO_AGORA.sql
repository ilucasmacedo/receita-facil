-- ============================================
-- CRIAR TABELA DE HISTÓRICO DE COMPRAS
-- Execute este SQL AGORA no Supabase SQL Editor
-- ============================================

-- Criar tabela de histórico
CREATE TABLE IF NOT EXISTS historico_compras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE NOT NULL,
  nome_ingrediente TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_comprada DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  data_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacao TEXT
);

-- Habilitar RLS
ALTER TABLE historico_compras ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can view own historico" 
  ON historico_compras FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own historico" 
  ON historico_compras FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own historico" 
  ON historico_compras FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_ingrediente 
  ON historico_compras(ingrediente_id, data_compra DESC);

CREATE INDEX IF NOT EXISTS idx_historico_user 
  ON historico_compras(user_id, data_compra DESC);

-- ============================================
-- PRONTO! Agora recarregue a aplicação
-- ============================================


