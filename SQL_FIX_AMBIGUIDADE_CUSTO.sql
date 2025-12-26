-- ========================================
-- CORREÇÃO: Ambiguidade em custo_total
-- ========================================
-- Execute este SQL no Editor SQL do Supabase

-- REMOVER função antiga
DROP FUNCTION IF EXISTS registrar_producao(INTEGER, UUID);

-- CRIAR função CORRIGIDA sem ambiguidade
CREATE OR REPLACE FUNCTION registrar_producao(
  quantidade_param INTEGER,
  receita_id_param UUID
)
RETURNS TABLE(
  sucesso BOOLEAN,
  mensagem TEXT,
  insumo_faltante TEXT,
  quantidade_necessaria DECIMAL,
  quantidade_disponivel DECIMAL
) AS $$
DECLARE
  user_id_var UUID;
  receita_record RECORD;
  insumo_item RECORD;
  qtd_necessaria DECIMAL;
  custo_total_producao DECIMAL := 0; -- RENOMEADO para evitar ambiguidade
BEGIN
  -- Buscar dados da receita
  SELECT 
    r.user_id, 
    r.nome, 
    r.custo_total as custo_receita
  INTO receita_record
  FROM receitas r
  WHERE r.id = receita_id_param;
  
  IF NOT FOUND THEN
    sucesso := FALSE;
    mensagem := 'Receita não encontrada';
    RETURN NEXT;
    RETURN;
  END IF;
  
  user_id_var := receita_record.user_id;
  
  -- VERIFICAR SE HÁ INSUMOS SUFICIENTES
  FOR insumo_item IN
    SELECT 
      ir.ingrediente_id,
      ir.quantidade_usada,
      i.nome,
      i.quantidade_total,
      i.unidade
    FROM itens_receita ir
    INNER JOIN ingredientes i ON ir.ingrediente_id = i.id
    WHERE ir.receita_id = receita_id_param
  LOOP
    -- Calcular quantidade necessária
    qtd_necessaria := insumo_item.quantidade_usada * quantidade_param;
    
    -- VERIFICAR SE TEM SUFICIENTE
    IF insumo_item.quantidade_total < qtd_necessaria THEN
      -- NÃO TEM SUFICIENTE - RETORNAR ERRO
      sucesso := FALSE;
      mensagem := 'Insumo insuficiente';
      insumo_faltante := insumo_item.nome;
      quantidade_necessaria := qtd_necessaria;
      quantidade_disponivel := insumo_item.quantidade_total;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;
  
  -- SE CHEGOU AQUI, TEM TUDO! VAMOS PRODUZIR:
  
  -- 1. DEDUZIR INSUMOS
  FOR insumo_item IN
    SELECT 
      ir.ingrediente_id,
      ir.quantidade_usada,
      i.nome,
      i.quantidade_total
    FROM itens_receita ir
    INNER JOIN ingredientes i ON ir.ingrediente_id = i.id
    WHERE ir.receita_id = receita_id_param
  LOOP
    qtd_necessaria := insumo_item.quantidade_usada * quantidade_param;
    
    -- Deduzir do estoque de insumos
    UPDATE ingredientes
    SET quantidade_total = quantidade_total - qtd_necessaria
    WHERE id = insumo_item.ingrediente_id;
    
    -- Registrar no histórico
    INSERT INTO historico_estoque (
      user_id,
      ingrediente_id,
      tipo_movimentacao,
      quantidade,
      quantidade_anterior,
      quantidade_nova,
      observacao
    ) VALUES (
      user_id_var,
      insumo_item.ingrediente_id,
      'saida_producao',
      qtd_necessaria,
      insumo_item.quantidade_total,
      insumo_item.quantidade_total - qtd_necessaria,
      'Usado na produção de ' || quantidade_param || ' unidades de ' || receita_record.nome
    );
  END LOOP;
  
  -- 2. ADICIONAR AO ESTOQUE DE PRODUTOS PRONTOS
  UPDATE receitas
  SET quantidade_em_estoque = COALESCE(quantidade_em_estoque, 0) + quantidade_param
  WHERE id = receita_id_param;
  
  -- 3. CALCULAR CUSTO TOTAL DA PRODUÇÃO (sem ambiguidade)
  custo_total_producao := (COALESCE(receita_record.custo_receita, 0) * quantidade_param);
  
  -- 4. REGISTRAR A PRODUÇÃO
  INSERT INTO producoes (
    user_id,
    receita_id,
    quantidade_produzida,
    custo_total_producao,
    data_producao
  ) VALUES (
    user_id_var,
    receita_id_param,
    quantidade_param,
    custo_total_producao,
    NOW()
  );
  
  -- RETORNAR SUCESSO
  sucesso := TRUE;
  mensagem := 'Produção registrada com sucesso! ' || quantidade_param || ' unidades adicionadas ao estoque.';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notificar PostgREST para recarregar
NOTIFY pgrst, 'reload schema';

-- Verificação
SELECT 
  '✅ Função corrigida!' as status,
  proname as funcao,
  pg_get_function_arguments(oid) as parametros
FROM pg_proc
WHERE proname = 'registrar_producao';

