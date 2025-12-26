-- ========================================
-- SQL COMPLETO E DEFINITIVO - PRODUÇÃO
-- ========================================
-- Execute este SQL para criar TUDO que está faltando
-- Este SQL é à prova de erros e cria/atualiza tudo automaticamente

-- ==========================================
-- PARTE 1: TABELA RECEITAS (adicionar colunas)
-- ==========================================

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS quantidade_em_estoque INTEGER DEFAULT 0;

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS estoque_minimo_produtos INTEGER DEFAULT 0;

COMMENT ON COLUMN receitas.quantidade_em_estoque IS 'Quantidade de PRODUTOS PRONTOS em estoque';
COMMENT ON COLUMN receitas.estoque_minimo_produtos IS 'Alerta quando produtos prontos estão abaixo deste valor';

-- ==========================================
-- PARTE 2: TABELA PRODUCOES (histórico de produção)
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

COMMENT ON TABLE producoes IS 'Registro de todas as produções realizadas';

-- ==========================================
-- PARTE 3: TABELA HISTORICO_ESTOQUE (completa com TODAS as colunas)
-- ==========================================

-- Criar tabela se não existir
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

-- Adicionar colunas se não existirem (caso a tabela já exista sem essas colunas)
ALTER TABLE historico_estoque 
ADD COLUMN IF NOT EXISTS quantidade_anterior DECIMAL(10,2);

ALTER TABLE historico_estoque 
ADD COLUMN IF NOT EXISTS quantidade_nova DECIMAL(10,2);

ALTER TABLE historico_estoque 
ADD COLUMN IF NOT EXISTS observacao TEXT;

COMMENT ON TABLE historico_estoque IS 'Histórico de todas as movimentações de insumos';
COMMENT ON COLUMN historico_estoque.tipo_movimentacao IS 'entrada_compra, saida_producao, saida_venda, ajuste_manual';

-- ==========================================
-- PARTE 4: FUNÇÃO REGISTRAR_PRODUCAO (corrigida)
-- ==========================================

-- Remover função antiga
DROP FUNCTION IF EXISTS registrar_producao(INTEGER, UUID);
DROP FUNCTION IF EXISTS registrar_producao(UUID, INTEGER);

-- Criar função COMPLETA e CORRIGIDA
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
  
  -- ============================================
  -- FASE 1: VERIFICAR SE HÁ INSUMOS SUFICIENTES
  -- ============================================
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
  
  -- ============================================
  -- FASE 2: DEDUZIR INSUMOS E REGISTRAR HISTÓRICO
  -- ============================================
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
    
    -- Registrar ANTES de deduzir (para ter quantidade_anterior)
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
    
    -- Deduzir do estoque de insumos
    UPDATE ingredientes
    SET quantidade_total = quantidade_total - qtd_necessaria
    WHERE id = insumo_item.ingrediente_id;
  END LOOP;
  
  -- ============================================
  -- FASE 3: ADICIONAR AO ESTOQUE DE PRODUTOS PRONTOS
  -- ============================================
  UPDATE receitas
  SET quantidade_em_estoque = COALESCE(quantidade_em_estoque, 0) + quantidade_param
  WHERE id = receita_id_param;
  
  -- ============================================
  -- FASE 4: CALCULAR CUSTO E REGISTRAR PRODUÇÃO
  -- ============================================
  custo_total_producao := (receita_record.custo_receita * quantidade_param);
  
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
  
  -- ============================================
  -- RETORNAR SUCESSO
  -- ============================================
  sucesso := TRUE;
  mensagem := 'Produção registrada com sucesso! ' || quantidade_param || ' unidades adicionadas ao estoque.';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION registrar_producao IS 'Registra produção: verifica insumos, deduz estoque, adiciona produtos prontos';

-- ==========================================
-- PARTE 5: RLS (Row Level Security)
-- ==========================================

-- RLS para PRODUCOES
ALTER TABLE producoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver suas produções" ON producoes;
CREATE POLICY "Usuários podem ver suas produções"
  ON producoes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar produções" ON producoes;
CREATE POLICY "Usuários podem criar produções"
  ON producoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS para HISTORICO_ESTOQUE
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
-- PARTE 6: NOTIFICAR POSTGREST
-- ==========================================

NOTIFY pgrst, 'reload schema';

-- ==========================================
-- PARTE 7: VERIFICAÇÃO FINAL
-- ==========================================

-- Verificar tabelas
SELECT 
  '✅ TABELAS VERIFICADAS' as status,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as total_colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('receitas', 'ingredientes', 'producoes', 'historico_estoque', 'itens_receita')
ORDER BY table_name;

-- Verificar função
SELECT 
  '✅ FUNÇÃO CRIADA' as status,
  proname as funcao,
  pg_get_function_arguments(oid) as parametros
FROM pg_proc
WHERE proname = 'registrar_producao';

-- Verificar colunas de historico_estoque
SELECT 
  '✅ COLUNAS DE HISTORICO_ESTOQUE' as status,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
ORDER BY ordinal_position;

-- Verificar colunas de receitas
SELECT 
  '✅ COLUNAS DE RECEITAS (novas)' as status,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'receitas'
AND column_name IN ('quantidade_em_estoque', 'estoque_minimo_produtos');

-- Mensagem final
SELECT 
  '🎉 CONFIGURAÇÃO COMPLETA!' as status,
  'Tudo pronto para produzir!' as mensagem;

