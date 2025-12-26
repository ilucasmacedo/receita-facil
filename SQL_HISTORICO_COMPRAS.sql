-- ============================================
-- CRIAR TABELA DE HISTÓRICO DE COMPRAS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Criar tabela de histórico de compras
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

-- Criar políticas de segurança
DROP POLICY IF EXISTS "Users can view own historico" ON historico_compras;
DROP POLICY IF EXISTS "Users can insert own historico" ON historico_compras;
DROP POLICY IF EXISTS "Users can delete own historico" ON historico_compras;

CREATE POLICY "Users can view own historico" 
  ON historico_compras FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own historico" 
  ON historico_compras FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own historico" 
  ON historico_compras FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_historico_ingrediente 
  ON historico_compras(ingrediente_id, data_compra DESC);

CREATE INDEX IF NOT EXISTS idx_historico_user 
  ON historico_compras(user_id, data_compra DESC);

-- ============================================
-- VIEW: Resumo de gastos por ingrediente
-- ============================================
CREATE OR REPLACE VIEW resumo_gastos_ingredientes AS
SELECT 
  ingrediente_id,
  nome_ingrediente,
  COUNT(*) as total_compras,
  SUM(valor_total) as total_gasto,
  SUM(quantidade_comprada) as quantidade_total_comprada,
  MIN(preco_compra) as menor_preco,
  MAX(preco_compra) as maior_preco,
  AVG(preco_compra) as preco_medio,
  MIN(data_compra) as primeira_compra,
  MAX(data_compra) as ultima_compra
FROM historico_compras
GROUP BY ingrediente_id, nome_ingrediente;

-- ============================================
-- Exemplo de consultas úteis
-- ============================================

-- Ver histórico de um ingrediente específico:
-- SELECT * FROM historico_compras 
-- WHERE ingrediente_id = 'seu_id_aqui' 
-- ORDER BY data_compra DESC;

-- Ver total gasto por ingrediente:
-- SELECT * FROM resumo_gastos_ingredientes 
-- ORDER BY total_gasto DESC;

-- Ver total gasto em um período:
-- SELECT SUM(valor_total) as total_gasto_periodo
-- FROM historico_compras
-- WHERE data_compra BETWEEN '2024-01-01' AND '2024-12-31';

