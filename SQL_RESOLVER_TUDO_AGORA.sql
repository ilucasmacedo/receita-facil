-- ========================================
-- SQL ÚNICO E DEFINITIVO - RESOLVE TUDO
-- ========================================
-- Este SQL cria/corrige TODAS as colunas e funções necessárias
-- Execute apenas este SQL para resolver todos os erros

-- ==========================================
-- PARTE 1: TABELA INGREDIENTES
-- ==========================================

-- Adicionar estoque_minimo
ALTER TABLE ingredientes 
ADD COLUMN IF NOT EXISTS estoque_minimo DECIMAL(10,2) DEFAULT 0;

-- Adicionar estoque_atual (compatibilidade)
ALTER TABLE ingredientes 
ADD COLUMN IF NOT EXISTS estoque_atual DECIMAL(10,2);

-- Copiar quantidade_total para estoque_atual se estiver vazio
UPDATE ingredientes
SET estoque_atual = quantidade_total
WHERE estoque_atual IS NULL;

-- Definir valores padrão inteligentes para estoque_minimo
UPDATE ingredientes
SET estoque_minimo = CASE 
  WHEN unidade = 'g' THEN 100
  WHEN unidade = 'kg' THEN 0.5
  WHEN unidade = 'ml' THEN 100
  WHEN unidade = 'L' THEN 0.5
  WHEN unidade = 'un' THEN 5
  ELSE 10
END
WHERE estoque_minimo = 0 OR estoque_minimo IS NULL;

-- ==========================================
-- PARTE 2: TABELA RECEITAS
-- ==========================================

-- Adicionar colunas de estoque de produtos
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS quantidade_em_estoque INTEGER DEFAULT 0;

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS estoque_minimo_produtos INTEGER DEFAULT 0;

-- Adicionar coluna ativo (soft delete)
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS data_desativacao TIMESTAMP WITH TIME ZONE;

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS motivo_desativacao TEXT;

-- ==========================================
-- PARTE 3: TABELA PRODUCOES
-- ==========================================

CREATE TABLE IF NOT EXISTS producoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE NOT NULL,
  quantidade_produzida INTEGER NOT NULL,
  custo_total_producao DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_producao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PARTE 4: TABELA HISTORICO_ESTOQUE (COMPLETA!)
-- ==========================================

-- Criar tabela se não existir (com TODAS as colunas)
CREATE TABLE IF NOT EXISTS historico_estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
  tipo_movimentacao TEXT NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  quantidade_anterior DECIMAL(10,2),
  quantidade_nova DECIMAL(10,2),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GARANTIR que as colunas existem (se a tabela já existia)
ALTER TABLE historico_estoque 
ADD COLUMN IF NOT EXISTS quantidade_anterior DECIMAL(10,2);

ALTER TABLE historico_estoque 
ADD COLUMN IF NOT EXISTS quantidade_nova DECIMAL(10,2);

ALTER TABLE historico_estoque 
ADD COLUMN IF NOT EXISTS observacao TEXT;

-- ==========================================
-- PARTE 5: FUNÇÃO REGISTRAR_PRODUCAO
-- ==========================================

-- Remover funções antigas
DROP FUNCTION IF EXISTS registrar_producao(INTEGER, UUID);
DROP FUNCTION IF EXISTS registrar_producao(UUID, INTEGER);

-- Criar função COMPLETA
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
  custo_total_producao DECIMAL := 0;
BEGIN
  -- Buscar dados da receita
  SELECT 
    r.user_id, 
    r.nome, 
    COALESCE(r.custo_total, 0) as custo_receita
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
  
  -- VERIFICAR INSUMOS SUFICIENTES
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
    qtd_necessaria := insumo_item.quantidade_usada * quantidade_param;
    
    IF insumo_item.quantidade_total < qtd_necessaria THEN
      sucesso := FALSE;
      mensagem := 'Insumo insuficiente';
      insumo_faltante := insumo_item.nome;
      quantidade_necessaria := qtd_necessaria;
      quantidade_disponivel := insumo_item.quantidade_total;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;
  
  -- DEDUZIR INSUMOS E REGISTRAR HISTÓRICO
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
    
    -- Registrar histórico ANTES de deduzir
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
    
    -- Deduzir do estoque
    UPDATE ingredientes
    SET quantidade_total = quantidade_total - qtd_necessaria
    WHERE id = insumo_item.ingrediente_id;
  END LOOP;
  
  -- ADICIONAR PRODUTOS PRONTOS
  UPDATE receitas
  SET quantidade_em_estoque = COALESCE(quantidade_em_estoque, 0) + quantidade_param
  WHERE id = receita_id_param;
  
  -- CALCULAR CUSTO
  custo_total_producao := (receita_record.custo_receita * quantidade_param);
  
  -- REGISTRAR PRODUÇÃO
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
  
  -- SUCESSO
  sucesso := TRUE;
  mensagem := 'Produção registrada com sucesso! ' || quantidade_param || ' unidades adicionadas ao estoque.';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PARTE 6: FUNÇÃO DESATIVAR_RECEITA
-- ==========================================

CREATE OR REPLACE FUNCTION desativar_receita(
  receita_id_param UUID,
  motivo_param TEXT DEFAULT 'Produto descontinuado'
)
RETURNS TABLE(
  sucesso BOOLEAN,
  mensagem TEXT,
  total_vendas BIGINT,
  quantidade_vendida BIGINT,
  total_faturado DECIMAL
) AS $$
DECLARE
  receita_nome TEXT;
  vendas_count BIGINT;
  qtd_vendida BIGINT;
  faturamento DECIMAL;
BEGIN
  SELECT nome INTO receita_nome
  FROM receitas
  WHERE id = receita_id_param;
  
  IF NOT FOUND THEN
    sucesso := FALSE;
    mensagem := 'Receita não encontrada';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Contar vendas (se a tabela existir)
  BEGIN
    SELECT 
      COUNT(*),
      COALESCE(SUM(iv.quantidade), 0),
      COALESCE(SUM(iv.valor_unitario * iv.quantidade), 0)
    INTO vendas_count, qtd_vendida, faturamento
    FROM itens_venda iv
    WHERE iv.receita_id = receita_id_param;
  EXCEPTION WHEN undefined_table THEN
    vendas_count := 0;
    qtd_vendida := 0;
    faturamento := 0;
  END;
  
  -- Desativar
  UPDATE receitas
  SET 
    ativo = FALSE,
    data_desativacao = NOW(),
    motivo_desativacao = motivo_param
  WHERE id = receita_id_param;
  
  sucesso := TRUE;
  mensagem := 'Receita "' || receita_nome || '" desativada com sucesso';
  total_vendas := vendas_count;
  quantidade_vendida := qtd_vendida;
  total_faturado := faturamento;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PARTE 7: FUNÇÃO REATIVAR_RECEITA
-- ==========================================

CREATE OR REPLACE FUNCTION reativar_receita(receita_id_param UUID)
RETURNS TABLE(
  sucesso BOOLEAN,
  mensagem TEXT
) AS $$
DECLARE
  receita_nome TEXT;
BEGIN
  SELECT nome INTO receita_nome
  FROM receitas
  WHERE id = receita_id_param;
  
  IF NOT FOUND THEN
    sucesso := FALSE;
    mensagem := 'Receita não encontrada';
    RETURN NEXT;
    RETURN;
  END IF;
  
  UPDATE receitas
  SET 
    ativo = TRUE,
    data_desativacao = NULL,
    motivo_desativacao = NULL
  WHERE id = receita_id_param;
  
  sucesso := TRUE;
  mensagem := 'Receita "' || receita_nome || '" reativada com sucesso';
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PARTE 8: RLS (ROW LEVEL SECURITY)
-- ==========================================

-- PRODUCOES
ALTER TABLE producoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver suas produções" ON producoes;
CREATE POLICY "Usuários podem ver suas produções"
  ON producoes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar produções" ON producoes;
CREATE POLICY "Usuários podem criar produções"
  ON producoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- HISTORICO_ESTOQUE
ALTER TABLE historico_estoque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seu histórico" ON historico_estoque;
CREATE POLICY "Usuários podem ver seu histórico"
  ON historico_estoque FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar histórico" ON historico_estoque;
CREATE POLICY "Usuários podem criar histórico"
  ON historico_estoque FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- PARTE 9: VIEWS
-- ==========================================

-- View de receitas ativas
DROP VIEW IF EXISTS receitas_ativas CASCADE;
CREATE OR REPLACE VIEW receitas_ativas AS
SELECT * FROM receitas
WHERE ativo = TRUE
ORDER BY nome;

-- View de receitas desativadas
DROP VIEW IF EXISTS receitas_desativadas CASCADE;
CREATE OR REPLACE VIEW receitas_desativadas AS
SELECT r.*
FROM receitas r
WHERE ativo = FALSE
ORDER BY data_desativacao DESC;

-- ==========================================
-- PARTE 10: NOTIFICAR POSTGREST
-- ==========================================

NOTIFY pgrst, 'reload schema';

-- ==========================================
-- PARTE 11: VERIFICAÇÃO FINAL
-- ==========================================

SELECT '🎉 SQL EXECUTADO COM SUCESSO!' as status;

-- Verificar tabelas
SELECT 
  '✅ TABELAS' as tipo,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('ingredientes', 'receitas', 'producoes', 'historico_estoque')
ORDER BY table_name;

-- Verificar colunas de historico_estoque
SELECT 
  '✅ COLUNAS HISTORICO_ESTOQUE' as tipo,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
ORDER BY ordinal_position;

-- Verificar funções
SELECT 
  '✅ FUNÇÕES' as tipo,
  proname as funcao
FROM pg_proc
WHERE proname IN ('registrar_producao', 'desativar_receita', 'reativar_receita')
ORDER BY proname;

-- Estatísticas de ingredientes
SELECT 
  '📊 INSUMOS' as tipo,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE estoque_minimo > 0) as com_minimo,
  COUNT(*) FILTER (WHERE quantidade_total <= 0) as sem_estoque
FROM ingredientes;

-- Estatísticas de receitas
SELECT 
  '📊 RECEITAS' as tipo,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE ativo = TRUE) as ativas,
  COUNT(*) FILTER (WHERE ativo = FALSE) as desativadas
FROM receitas;

SELECT '🚀 TUDO PRONTO PARA PRODUZIR!' as resultado;

