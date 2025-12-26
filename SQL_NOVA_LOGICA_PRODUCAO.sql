-- ========================================
-- NOVA LÓGICA: INSUMOS → PRODUÇÃO → VENDA
-- ========================================

-- PASSO 1: Renomear conceptualmente (na interface será: Insumos)
-- A tabela 'ingredientes' agora representa INSUMOS (matéria-prima)
COMMENT ON TABLE ingredientes IS 'INSUMOS: Tudo que você compra (farinha, embalagem, etc)';

-- PASSO 2: Renomear conceptualmente (na interface será: Modelos de Produção)
-- A tabela 'receitas' agora representa MODELOS (fórmulas, não estoque)
COMMENT ON TABLE receitas IS 'MODELOS DE PRODUÇÃO: Fórmulas/fichas técnicas (não é estoque real)';

-- PASSO 3: Adicionar controle de PRODUTOS PRONTOS nas receitas
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS quantidade_em_estoque INTEGER DEFAULT 0;

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS estoque_minimo_produtos INTEGER DEFAULT 0;

COMMENT ON COLUMN receitas.quantidade_em_estoque IS 'Quantidade de PRODUTOS PRONTOS em estoque';
COMMENT ON COLUMN receitas.estoque_minimo_produtos IS 'Alerta quando produtos prontos < este valor';

-- PASSO 4: Criar tabela de REGISTRO DE PRODUÇÃO
CREATE TABLE IF NOT EXISTS producoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  receita_id UUID REFERENCES receitas(id) NOT NULL,
  quantidade_produzida INTEGER NOT NULL,
  custo_total_producao DECIMAL(10,2) NOT NULL,
  data_producao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE producoes IS 'REGISTRO DE PRODUÇÃO: Quando você transforma insumos em produtos prontos';

-- PASSO 5: Função para REGISTRAR PRODUÇÃO
CREATE OR REPLACE FUNCTION registrar_producao(
  receita_id_param UUID,
  quantidade_param INTEGER
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
  receita RECORD;
  insumo_item RECORD;
  quantidade_necessaria DECIMAL;
  custo_total DECIMAL := 0;
  insumo_nome TEXT;
BEGIN
  -- Buscar user_id da receita
  SELECT user_id, nome, custo_total INTO receita
  FROM receitas 
  WHERE id = receita_id_param;
  
  user_id_var := receita.user_id;
  
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
    -- Calcular quantidade necessária para produzir X unidades
    quantidade_necessaria := insumo_item.quantidade_usada * quantidade_param;
    
    -- VERIFICAR SE TEM SUFICIENTE
    IF insumo_item.quantidade_total < quantidade_necessaria THEN
      -- NÃO TEM SUFICIENTE - RETORNAR ERRO
      sucesso := FALSE;
      mensagem := 'Insumo insuficiente';
      insumo_faltante := insumo_item.nome;
      quantidade_necessaria := quantidade_necessaria;
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
    quantidade_necessaria := insumo_item.quantidade_usada * quantidade_param;
    
    -- Deduzir do estoque de insumos
    UPDATE ingredientes
    SET quantidade_total = quantidade_total - quantidade_necessaria
    WHERE id = insumo_item.ingrediente_id;
    
    -- Registrar no histórico de estoque
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
      quantidade_necessaria,
      insumo_item.quantidade_total,
      insumo_item.quantidade_total - quantidade_necessaria,
      'Usado na produção de ' || quantidade_param || ' unidades de ' || receita.nome
    );
  END LOOP;
  
  -- 2. ADICIONAR AO ESTOQUE DE PRODUTOS PRONTOS
  UPDATE receitas
  SET quantidade_em_estoque = quantidade_em_estoque + quantidade_param
  WHERE id = receita_id_param;
  
  -- 3. REGISTRAR A PRODUÇÃO
  custo_total := (receita.custo_total * quantidade_param);
  
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
    custo_total,
    NOW()
  );
  
  -- RETORNAR SUCESSO
  sucesso := TRUE;
  mensagem := 'Produção registrada com sucesso!';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- PASSO 6: Modificar função de VENDA para deduzir APENAS de produtos prontos
DROP FUNCTION IF EXISTS deduzir_estoque_venda(UUID);

CREATE OR REPLACE FUNCTION deduzir_estoque_venda_produtos(venda_id_param UUID)
RETURNS TABLE(
  sucesso BOOLEAN,
  mensagem TEXT,
  receita_nome TEXT,
  quantidade_necessaria INTEGER,
  quantidade_disponivel INTEGER
) AS $$
DECLARE
  item RECORD;
BEGIN
  -- Para cada item da venda
  FOR item IN 
    SELECT iv.*, r.nome, r.quantidade_em_estoque
    FROM itens_venda iv
    INNER JOIN receitas r ON iv.receita_id = r.id
    WHERE iv.venda_id = venda_id_param
  LOOP
    -- VERIFICAR SE TEM PRODUTOS PRONTOS SUFICIENTES
    IF item.quantidade_em_estoque < item.quantidade THEN
      sucesso := FALSE;
      mensagem := 'Produto insuficiente no estoque';
      receita_nome := item.nome;
      quantidade_necessaria := item.quantidade;
      quantidade_disponivel := item.quantidade_em_estoque;
      RETURN NEXT;
      RETURN;
    END IF;
    
    -- DEDUZIR DO ESTOQUE DE PRODUTOS PRONTOS
    UPDATE receitas
    SET quantidade_em_estoque = quantidade_em_estoque - item.quantidade
    WHERE id = item.receita_id;
    
    -- Retornar sucesso
    sucesso := TRUE;
    mensagem := 'Estoque deduzido com sucesso';
    receita_nome := item.nome;
    quantidade_necessaria := item.quantidade;
    quantidade_disponivel := item.quantidade_em_estoque;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- PASSO 7: Atualizar trigger de venda
DROP TRIGGER IF EXISTS trigger_venda_concluida ON vendas;

CREATE OR REPLACE FUNCTION trigger_deduzir_produtos()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'concluida' THEN
    PERFORM deduzir_estoque_venda_produtos(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_venda_concluida
  AFTER INSERT ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_deduzir_produtos();

-- PASSO 8: RLS para producoes
ALTER TABLE producoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver suas produções" ON producoes;
CREATE POLICY "Usuários podem ver suas produções"
  ON producoes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar produções" ON producoes;
CREATE POLICY "Usuários podem criar produções"
  ON producoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PASSO 9: View para relatório de capacidade de produção
CREATE OR REPLACE VIEW capacidade_producao AS
SELECT 
  r.id as receita_id,
  r.user_id,
  r.nome as receita_nome,
  r.quantidade_em_estoque as produtos_prontos,
  MIN(FLOOR(i.quantidade_total / ir.quantidade_usada)) as capacidade_producao,
  CASE 
    WHEN r.quantidade_em_estoque <= r.estoque_minimo_produtos THEN 'producao_necessaria'
    WHEN MIN(FLOOR(i.quantidade_total / ir.quantidade_usada)) < 5 THEN 'insumos_baixos'
    ELSE 'ok'
  END as status
FROM receitas r
INNER JOIN itens_receita ir ON r.id = ir.receita_id
INNER JOIN ingredientes i ON ir.ingrediente_id = i.id
GROUP BY r.id, r.nome, r.quantidade_em_estoque, r.estoque_minimo_produtos;

COMMENT ON VIEW capacidade_producao IS 'Mostra: produtos prontos vs capacidade de produzir mais com insumos atuais';

-- PASSO 10: Atualizar tipo de movimentação no histórico
ALTER TABLE historico_estoque 
ALTER COLUMN tipo_movimentacao TYPE TEXT;

COMMENT ON COLUMN historico_estoque.tipo_movimentacao IS 'entrada_compra, saida_producao, saida_venda, ajuste_manual';

-- PASSO 11: Notificar PostgREST
NOTIFY pgrst, 'reload schema';

-- PASSO 12: Verificação
SELECT 
  'Nova lógica configurada!' as status,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('ingredientes', 'receitas', 'producoes', 'vendas')
ORDER BY table_name;

-- PASSO 13: Mostrar funções criadas
SELECT 
  'Funções criadas!' as status,
  proname as funcao
FROM pg_proc
WHERE proname IN ('registrar_producao', 'deduzir_estoque_venda_produtos');

