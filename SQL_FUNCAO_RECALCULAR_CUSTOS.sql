-- ========================================
-- FUNÇÃO: RECALCULAR CUSTOS DE RECEITA
-- ========================================
-- Execute este SQL no Editor SQL do Supabase

-- PASSO 1: Remover a função se já existir
DROP FUNCTION IF EXISTS recalcular_custo_receita(UUID);

-- PASSO 2: Criar a função para recalcular custos
CREATE OR REPLACE FUNCTION recalcular_custo_receita(receita_id_param UUID)
RETURNS TABLE(custo_total DECIMAL, preco_venda DECIMAL) AS $$
DECLARE
  custo_calculado DECIMAL := 0;
  preco_calculado DECIMAL := 0;
  margem_lucro DECIMAL := 100;
BEGIN
  -- Buscar a margem de lucro da receita
  SELECT margem_lucro_desejada INTO margem_lucro
  FROM receitas
  WHERE id = receita_id_param;

  -- Calcular o custo total somando todos os ingredientes
  SELECT COALESCE(SUM(
    CASE 
      -- Se o ingrediente é de produção própria, usa o custo da receita origem
      WHEN i.tipo_origem = 'producao_propria' THEN 
        (COALESCE(r_origem.custo_total, 0) / NULLIF(i.quantidade_por_receita, 0)) * ir.quantidade_usada
      -- Se é comprado, calcula baseado no preço por unidade
      ELSE
        (i.preco_compra / NULLIF(i.quantidade_total, 0)) * ir.quantidade_usada
    END
  ), 0) INTO custo_calculado
  FROM itens_receita ir
  INNER JOIN ingredientes i ON ir.ingrediente_id = i.id
  LEFT JOIN receitas r_origem ON i.receita_origem_id = r_origem.id
  WHERE ir.receita_id = receita_id_param;

  -- Calcular o preço de venda baseado na margem de lucro
  preco_calculado := custo_calculado * (1 + (margem_lucro / 100));

  -- Atualizar a receita com os novos valores
  UPDATE receitas
  SET 
    custo_total = custo_calculado,
    preco_venda = preco_calculado,
    requer_atualizacao = FALSE,
    ultima_atualizacao_custos = NOW()
  WHERE id = receita_id_param;

  -- Retornar os valores calculados
  RETURN QUERY SELECT custo_calculado, preco_calculado;
END;
$$ LANGUAGE plpgsql;

-- PASSO 3: Notificar o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';

-- PASSO 4: Verificar se a função foi criada
SELECT 
  proname as "Nome da Função",
  prokind as "Tipo (f=função)"
FROM pg_proc
WHERE proname = 'recalcular_custo_receita';

-- PASSO 5: Teste rápido (opcional - descomente para testar)
-- SELECT * FROM recalcular_custo_receita('coloque-um-uuid-de-receita-aqui');

