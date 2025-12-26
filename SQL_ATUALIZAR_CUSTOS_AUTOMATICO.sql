-- SQL: Sistema de Atualização Automática de Custos
-- Detecta quando ingredientes mudam e atualiza receitas automaticamente

-- 1. Adicionar campos de controle na tabela receitas
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS ultima_atualizacao_custos TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS requer_atualizacao BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN receitas.ultima_atualizacao_custos IS 'Data da última vez que os custos foram recalculados';
COMMENT ON COLUMN receitas.requer_atualizacao IS 'TRUE se algum ingrediente foi alterado após o último cálculo';

-- 2. Criar função para marcar receitas que usam um ingrediente específico
CREATE OR REPLACE FUNCTION marcar_receitas_para_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Marcar todas as receitas que usam este ingrediente
  UPDATE receitas
  SET requer_atualizacao = TRUE
  WHERE id IN (
    SELECT DISTINCT receita_id 
    FROM itens_receita 
    WHERE ingrediente_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger para detectar mudanças em ingredientes
DROP TRIGGER IF EXISTS trigger_ingrediente_alterado ON ingredientes;
CREATE TRIGGER trigger_ingrediente_alterado
  AFTER UPDATE OF preco_compra, quantidade_total, tipo_origem
  ON ingredientes
  FOR EACH ROW
  WHEN (OLD.preco_compra IS DISTINCT FROM NEW.preco_compra 
    OR OLD.quantidade_total IS DISTINCT FROM NEW.quantidade_total
    OR OLD.tipo_origem IS DISTINCT FROM NEW.tipo_origem)
  EXECUTE FUNCTION marcar_receitas_para_atualizacao();

-- 4. Criar função para recalcular custo de uma receita
CREATE OR REPLACE FUNCTION recalcular_custo_receita(receita_id_param UUID)
RETURNS TABLE(
  novo_custo_total DECIMAL(10,2),
  novo_preco_venda DECIMAL(10,2),
  itens_atualizados INT
) AS $$
DECLARE
  v_custo_total DECIMAL(10,2) := 0;
  v_preco_venda DECIMAL(10,2) := 0;
  v_margem DECIMAL(10,2);
  v_itens INT := 0;
BEGIN
  -- Calcular novo custo baseado nos ingredientes atuais
  SELECT 
    COALESCE(SUM(
      (i.preco_compra / NULLIF(i.quantidade_total, 0)) * ir.quantidade_usada
    ), 0),
    COUNT(*)
  INTO v_custo_total, v_itens
  FROM itens_receita ir
  JOIN ingredientes i ON ir.ingrediente_id = i.id
  WHERE ir.receita_id = receita_id_param;

  -- Buscar margem de lucro da receita
  SELECT margem_lucro_desejada 
  INTO v_margem
  FROM receitas 
  WHERE id = receita_id_param;

  -- Calcular preço de venda
  v_preco_venda := v_custo_total * (1 + (v_margem / 100));

  -- Atualizar receita
  UPDATE receitas
  SET 
    custo_total = v_custo_total,
    preco_venda = v_preco_venda,
    requer_atualizacao = FALSE,
    ultima_atualizacao_custos = NOW()
  WHERE id = receita_id_param;

  -- Retornar resultados
  RETURN QUERY SELECT v_custo_total, v_preco_venda, v_itens;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar função para recalcular todas as receitas desatualizadas
CREATE OR REPLACE FUNCTION recalcular_todas_receitas_desatualizadas()
RETURNS TABLE(
  receita_id UUID,
  receita_nome TEXT,
  custo_anterior DECIMAL(10,2),
  custo_novo DECIMAL(10,2),
  diferenca DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH receitas_para_atualizar AS (
    SELECT 
      r.id,
      r.nome,
      r.custo_total as custo_old
    FROM receitas r
    WHERE r.requer_atualizacao = TRUE
  ),
  atualizacoes AS (
    SELECT 
      rpa.id,
      rpa.nome,
      rpa.custo_old,
      (recalcular_custo_receita(rpa.id)).novo_custo_total as custo_new
    FROM receitas_para_atualizar rpa
  )
  SELECT 
    a.id,
    a.nome,
    a.custo_old,
    a.custo_new,
    (a.custo_new - a.custo_old) as diferenca
  FROM atualizacoes a;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar view para mostrar receitas que precisam atualização
CREATE OR REPLACE VIEW receitas_desatualizadas AS
SELECT 
  r.id,
  r.nome,
  r.custo_total,
  r.preco_venda,
  r.ultima_atualizacao_custos,
  COUNT(DISTINCT ir.ingrediente_id) as total_ingredientes,
  ARRAY_AGG(DISTINCT i.nome) as ingredientes_alterados
FROM receitas r
JOIN itens_receita ir ON r.id = ir.receita_id
JOIN ingredientes i ON ir.ingrediente_id = i.id
WHERE r.requer_atualizacao = TRUE
GROUP BY r.id, r.nome, r.custo_total, r.preco_venda, r.ultima_atualizacao_custos;

-- 7. Recarregar schema
NOTIFY pgrst, 'reload schema';

-- 8. Exemplos de uso (comentados)
/*
-- Ver receitas que precisam atualização
SELECT * FROM receitas_desatualizadas;

-- Recalcular uma receita específica
SELECT * FROM recalcular_custo_receita('id_da_receita');

-- Recalcular todas as receitas desatualizadas
SELECT * FROM recalcular_todas_receitas_desatualizadas();

-- Ver status de todas as receitas
SELECT 
  nome,
  custo_total,
  requer_atualizacao,
  ultima_atualizacao_custos
FROM receitas
ORDER BY requer_atualizacao DESC, nome;
*/

