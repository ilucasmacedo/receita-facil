-- Atualizar tabela de receitas para incluir foto e outros campos úteis
-- Execute este SQL no SQL Editor do Supabase

-- 1. Verificar se a tabela existe e adicionar campos necessários
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS tempo_preparo_minutos INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS custo_total DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS preco_venda DECIMAL(10,2) DEFAULT 0;

-- 2. Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_receitas_user 
  ON receitas(user_id, created_at DESC);

-- 3. Verificar estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'receitas'
ORDER BY ordinal_position;

-- 4. Notificar o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';

