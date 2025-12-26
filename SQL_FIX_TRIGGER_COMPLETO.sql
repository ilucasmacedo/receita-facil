-- ========================================
-- SOLUÇÃO COMPLETA: TRIGGER DE ATUALIZAÇÃO
-- ========================================
-- Execute este SQL no Editor SQL do Supabase

-- PASSO 1: Limpar tudo que pode estar incorreto
DROP TRIGGER IF EXISTS trigger_ingrediente_alterado ON ingredientes;
DROP FUNCTION IF EXISTS marcar_receitas_para_atualizacao();

-- PASSO 2: Criar a função que marca receitas para atualização
CREATE OR REPLACE FUNCTION marcar_receitas_para_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug (você pode ver isso no Supabase Logs)
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
  
  -- Log de quantas receitas foram afetadas
  RAISE NOTICE 'Receitas marcadas para atualização: %', (
    SELECT COUNT(*)
    FROM receitas
    WHERE requer_atualizacao = TRUE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 3: Criar o trigger (SIMPLIFICADO - sem WHEN clause)
CREATE TRIGGER trigger_ingrediente_alterado
  AFTER UPDATE OF preco_compra, quantidade_total, tipo_origem
  ON ingredientes
  FOR EACH ROW
  EXECUTE FUNCTION marcar_receitas_para_atualizacao();

-- PASSO 4: Marcar todas as receitas existentes para atualização (para garantir)
UPDATE receitas
SET requer_atualizacao = TRUE
WHERE id IN (
  SELECT DISTINCT receita_id
  FROM itens_receita
);

-- PASSO 5: Notificar o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';

-- PASSO 6: Verificar se o trigger foi criado
SELECT 
  tgname as "Nome do Trigger",
  tgenabled as "Está Ativado?" -- (O = origin/ativado, D = desativado)
FROM pg_trigger
WHERE tgname = 'trigger_ingrediente_alterado';

-- PASSO 7: Verificar se a função existe
SELECT 
  proname as "Nome da Função",
  prosrc as "Código"
FROM pg_proc
WHERE proname = 'marcar_receitas_para_atualizacao';

