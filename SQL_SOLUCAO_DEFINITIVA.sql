-- ============================================
-- SOLUÇÃO DEFINITIVA: RECRIAR TABELA E ATUALIZAR CACHE
-- Execute este SQL COMPLETO no Supabase SQL Editor
-- ============================================

-- PASSO 1: Remover tudo relacionado à tabela (se existir)
DROP TABLE IF EXISTS ingredientes CASCADE;

-- PASSO 2: Aguardar um momento (comentário - execute o próximo bloco após alguns segundos)
-- Na prática, apenas continue executando os comandos abaixo

-- PASSO 3: Recriar a tabela do zero
CREATE TABLE ingredientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_total DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 4: Habilitar RLS
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can insert own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can update own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can delete own ingredientes" ON ingredientes;

-- PASSO 6: Criar políticas de segurança
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

-- PASSO 7: Inserir ingredientes de exemplo com seu user_id
INSERT INTO ingredientes (user_id, nome, preco_compra, quantidade_total, unidade) VALUES
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Farinha de Trigo', 10.00, 2000, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Açúcar', 8.50, 1000, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Sal', 2.40, 500, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Óleo de Soja', 12.00, 900, 'ml'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Ovos', 15.00, 12, 'un'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Leite', 5.50, 1000, 'ml'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Manteiga', 18.00, 500, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Fermento em Pó', 4.50, 200, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Cacau em Pó', 25.00, 500, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Baunilha', 12.00, 50, 'ml');

-- ============================================
-- IMPORTANTE: Após executar este SQL
-- ============================================
-- 1. AGUARDE 20-30 SEGUNDOS
-- 2. Recarregue a página da aplicação (F5)
-- 3. Ou clique no botão "Recarregar" na página de Ingredientes
-- ============================================

