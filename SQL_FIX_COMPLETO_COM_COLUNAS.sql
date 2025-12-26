-- ========================================
-- SOLUÇÃO DEFINITIVA: COLUNAS + TRIGGER
-- ========================================
-- Execute este SQL no Editor SQL do Supabase

-- PASSO 1: Adicionar as colunas necessárias (se não existirem)
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS ultima_atualizacao_custos TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS requer_atualizacao BOOLEAN DEFAULT FALSE;

-- PASSO 2: Limpar triggers e funções antigas
DROP TRIGGER IF EXISTS trigger_ingrediente_alterado ON ingredientes;
DROP FUNCTION IF EXISTS marcar_receitas_para_atualizacao();

-- PASSO 3: Criar a função que marca receitas para atualização
CREATE OR REPLACE FUNCTION marcar_receitas_para_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger disparado para ingrediente: %', NEW.id;
  
  -- Marcar todas as receitas que usam este ingrediente
  UPDATE receitas
  SET 
    requer_atualizacao = TRUE,
    ultima_atualizacao_custos = NOW()
  WHERE id IN (
    SELECT DISTINCT receita_id
    FROM itens_receita
    WHERE ingrediente_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 4: Criar o trigger
CREATE TRIGGER trigger_ingrediente_alterado
  AFTER UPDATE OF preco_compra, quantidade_total, tipo_origem
  ON ingredientes
  FOR EACH ROW
  EXECUTE FUNCTION marcar_receitas_para_atualizacao();

-- PASSO 5: Marcar todas as receitas existentes para atualização
UPDATE receitas
SET requer_atualizacao = TRUE
WHERE id IN (
  SELECT DISTINCT receita_id
  FROM itens_receita
);

-- PASSO 6: Notificar o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';

-- PASSO 7: Verificar se tudo foi criado
SELECT 'Colunas criadas:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'receitas' 
AND column_name IN ('requer_atualizacao', 'ultima_atualizacao_custos');

SELECT 'Trigger criado:' as status;
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'trigger_ingrediente_alterado';

SELECT 'Função criada:' as status;
SELECT proname 
FROM pg_proc 
WHERE proname = 'marcar_receitas_para_atualizacao';

