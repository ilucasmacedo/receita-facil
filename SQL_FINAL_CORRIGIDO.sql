-- ========================================
-- SQL COMPLETO E CORRIGIDO - TODAS AS TABELAS
-- ========================================
-- Este SQL cria TUDO na ordem correta, incluindo tabelas de vendas

-- ==========================================
-- PARTE 1: TABELA INGREDIENTES
-- ==========================================

ALTER TABLE ingredientes 
ADD COLUMN IF NOT EXISTS estoque_minimo DECIMAL(10,2) DEFAULT 0;

ALTER TABLE ingredientes 
ADD COLUMN IF NOT EXISTS estoque_atual DECIMAL(10,2);

UPDATE ingredientes
SET estoque_atual = quantidade_total
WHERE estoque_atual IS NULL;

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

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS quantidade_em_estoque INTEGER DEFAULT 0;

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS estoque_minimo_produtos INTEGER DEFAULT 0;

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

ALTER TABLE historico_estoque 
ADD COLUMN IF NOT EXISTS quantidade_anterior DECIMAL(10,2);

ALTER TABLE historico_estoque 
ADD COLUMN IF NOT EXISTS quantidade_nova DECIMAL(10,2);

ALTER TABLE historico_estoque 
ADD COLUMN IF NOT EXISTS observacao TEXT;

-- ==========================================
-- PARTE 5: TABELAS DE VENDAS (NOVA!)
-- ==========================================

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'concluida',
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS itens_venda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE NOT NULL,
  receita_id UUID REFERENCES receitas(id) NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PARTE 6: FUNÇÃO REGISTRAR_PRODUCAO
-- ==========================================

DROP FUNCTION IF EXISTS registrar_producao(INTEGER, UUID);
DROP FUNCTION IF EXISTS registrar_producao(UUID, INTEGER);

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
    
    UPDATE ingredientes
    SET quantidade_total = quantidade_total - qtd_necessaria
    WHERE id = insumo_item.ingrediente_id;
  END LOOP;
  
  UPDATE receitas
  SET quantidade_em_estoque = COALESCE(quantidade_em_estoque, 0) + quantidade_param
  WHERE id = receita_id_param;
  
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
  
  sucesso := TRUE;
  mensagem := 'Produção registrada com sucesso! ' || quantidade_param || ' unidades adicionadas ao estoque.';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PARTE 7: FUNÇÃO DESATIVAR_RECEITA
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
  vendas_count BIGINT := 0;
  qtd_vendida BIGINT := 0;
  faturamento DECIMAL := 0;
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
  
  SELECT 
    COUNT(*),
    COALESCE(SUM(iv.quantidade), 0),
    COALESCE(SUM(iv.subtotal), 0)
  INTO vendas_count, qtd_vendida, faturamento
  FROM itens_venda iv
  WHERE iv.receita_id = receita_id_param;
  
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
-- PARTE 8: FUNÇÃO REATIVAR_RECEITA
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
-- PARTE 9: RLS (ROW LEVEL SECURITY)
-- ==========================================

ALTER TABLE producoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver suas produções" ON producoes;
CREATE POLICY "Usuários podem ver suas produções"
  ON producoes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem criar produções" ON producoes;
CREATE POLICY "Usuários podem criar produções"
  ON producoes FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE historico_estoque ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver seu histórico" ON historico_estoque;
CREATE POLICY "Usuários podem ver seu histórico"
  ON historico_estoque FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem criar histórico" ON historico_estoque;
CREATE POLICY "Usuários podem criar histórico"
  ON historico_estoque FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver suas vendas" ON vendas;
CREATE POLICY "Usuários podem ver suas vendas"
  ON vendas FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem criar vendas" ON vendas;
CREATE POLICY "Usuários podem criar vendas"
  ON vendas FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuários podem atualizar vendas" ON vendas;
CREATE POLICY "Usuários podem atualizar vendas"
  ON vendas FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver itens de suas vendas" ON itens_venda;
CREATE POLICY "Usuários podem ver itens de suas vendas"
  ON itens_venda FOR SELECT USING (
    EXISTS (SELECT 1 FROM vendas WHERE vendas.id = itens_venda.venda_id AND vendas.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Usuários podem criar itens de venda" ON itens_venda;
CREATE POLICY "Usuários podem criar itens de venda"
  ON itens_venda FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM vendas WHERE vendas.id = itens_venda.venda_id AND vendas.user_id = auth.uid())
  );

-- ==========================================
-- PARTE 10: VIEWS
-- ==========================================

DROP VIEW IF EXISTS receitas_ativas CASCADE;
CREATE OR REPLACE VIEW receitas_ativas AS
SELECT * FROM receitas
WHERE ativo = TRUE
ORDER BY nome;

DROP VIEW IF EXISTS receitas_desativadas CASCADE;
CREATE OR REPLACE VIEW receitas_desativadas AS
SELECT 
  r.*,
  (SELECT COUNT(*) FROM itens_venda iv WHERE iv.receita_id = r.id) as total_vendas,
  (SELECT SUM(iv.quantidade) FROM itens_venda iv WHERE iv.receita_id = r.id) as quantidade_vendida,
  (SELECT SUM(iv.subtotal) FROM itens_venda iv WHERE iv.receita_id = r.id) as total_faturado
FROM receitas r
WHERE ativo = FALSE
ORDER BY data_desativacao DESC;

-- ==========================================
-- PARTE 11: NOTIFICAR POSTGREST
-- ==========================================

NOTIFY pgrst, 'reload schema';

-- ==========================================
-- PARTE 12: VERIFICAÇÃO FINAL
-- ==========================================

SELECT '🎉 SQL EXECUTADO COM SUCESSO!' as status;

SELECT 
  '✅ TABELAS CRIADAS' as tipo,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('ingredientes', 'receitas', 'producoes', 'historico_estoque', 'vendas', 'itens_venda')
ORDER BY table_name;

SELECT 
  '✅ COLUNAS HISTORICO_ESTOQUE' as tipo,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
ORDER BY ordinal_position;

SELECT 
  '✅ FUNÇÕES CRIADAS' as tipo,
  proname as funcao
FROM pg_proc
WHERE proname IN ('registrar_producao', 'desativar_receita', 'reativar_receita')
ORDER BY proname;

SELECT 
  '📊 ESTATÍSTICAS' as tipo,
  'Ingredientes' as tabela,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE estoque_minimo > 0) as com_config
FROM ingredientes
UNION ALL
SELECT 
  '📊 ESTATÍSTICAS',
  'Receitas',
  COUNT(*),
  COUNT(*) FILTER (WHERE ativo = TRUE)
FROM receitas;

SELECT '🚀 TUDO PRONTO! Sistema completo configurado!' as resultado;

