-- SQL: Corrigir Trigger que Não Está Funcionando
-- Execute este SQL se o trigger não estiver detectando mudanças

-- 1. Remover trigger antigo
DROP TRIGGER IF EXISTS trigger_ingrediente_alterado ON ingredientes;

-- 2. Recriar função (versão simplificada e mais confiável)
CREATE OR REPLACE FUNCTION marcar_receitas_para_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger disparado! Ingrediente alterado: %', NEW.id;
  
  -- Marcar todas as receitas que usam este ingrediente
  UPDATE receitas
  SET requer_atualizacao = TRUE
  WHERE id IN (
    SELECT DISTINCT receita_id 
    FROM itens_receita 
    WHERE ingrediente_id = NEW.id
  );
  
  -- Log quantas receitas foram marcadas
  RAISE NOTICE 'Receitas marcadas: %', (
    SELECT COUNT(DISTINCT receita_id) 
    FROM itens_receita 
    WHERE ingrediente_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger SIMPLIFICADO (sem condição WHEN)
CREATE TRIGGER trigger_ingrediente_alterado
  AFTER UPDATE OF preco_compra, quantidade_total, tipo_origem
  ON ingredientes
  FOR EACH ROW
  EXECUTE FUNCTION marcar_receitas_para_atualizacao();

-- 4. Verificar se trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_ingrediente_alterado';

-- 5. Habilitar logs do PostgreSQL (opcional)
-- Isso vai mostrar os RAISE NOTICE no log do Supabase
-- ALTER DATABASE postgres SET log_min_messages TO 'notice';

-- 6. Recarregar schema
NOTIFY pgrst, 'reload schema';

-- 7. Teste manual (substitua os IDs pelos seus)
/*
-- Teste 1: Ver receitas atuais
SELECT id, nome, requer_atualizacao FROM receitas;

-- Teste 2: Escolha um ingrediente que está em uma receita
SELECT 
  i.id,
  i.nome,
  i.preco_compra,
  COUNT(ir.receita_id) as usado_em_receitas
FROM ingredientes i
LEFT JOIN itens_receita ir ON i.id = ir.ingrediente_id
GROUP BY i.id, i.nome, i.preco_compra
HAVING COUNT(ir.receita_id) > 0;

-- Teste 3: Alterar o preço do ingrediente
UPDATE ingredientes
SET preco_compra = preco_compra + 1
WHERE nome = 'Farinha de Trigo'; -- Substitua pelo nome do seu ingrediente

-- Teste 4: Verificar se receitas foram marcadas
SELECT id, nome, requer_atualizacao FROM receitas;
-- Deve mostrar requer_atualizacao = TRUE nas receitas que usam o ingrediente
*/

