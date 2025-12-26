-- ========================================
-- CORREÇÃO URGENTE: Função registrar_producao
-- ========================================
-- Execute este SQL no Editor SQL do Supabase

-- PASSO 1: Verificar se as colunas existem
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS quantidade_em_estoque INTEGER DEFAULT 0;

ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS estoque_minimo_produtos INTEGER DEFAULT 0;

-- PASSO 2: Criar tabela de producoes (se não existir)
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

-- PASSO 3: Criar tabela historico_estoque (se não existir)
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

-- PASSO 4: Remover função antiga (se existir)
DROP FUNCTION IF EXISTS registrar_producao(UUID, INTEGER);
DROP FUNCTION IF EXISTS registrar_producao(INTEGER, UUID);
DROP FUNCTION IF EXISTS registrar_producao(quantidade_param INTEGER, receita_id_param UUID);

-- PASSO 5: Criar a função CORRETA com parâmetros na ORDEM CERTA
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
  receita RECORD;
  insumo_item RECORD;
  qtd_necessaria DECIMAL;
  custo_total DECIMAL := 0;
BEGIN
  -- Buscar user_id da receita
  SELECT user_id, nome, custo_total INTO receita
  FROM receitas 
  WHERE id = receita_id_param;
  
  IF NOT FOUND THEN
    sucesso := FALSE;
    mensagem := 'Receita não encontrada';
    RETURN NEXT;
    RETURN;
  END IF;
  
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
      'Usado na produção de ' || quantidade_param || ' unidades de ' || receita.nome
    );
  END LOOP;
  
  -- 2. ADICIONAR AO ESTOQUE DE PRODUTOS PRONTOS
  UPDATE receitas
  SET quantidade_em_estoque = COALESCE(quantidade_em_estoque, 0) + quantidade_param
  WHERE id = receita_id_param;
  
  -- 3. REGISTRAR A PRODUÇÃO
  custo_total := (COALESCE(receita.custo_total, 0) * quantidade_param);
  
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
  mensagem := 'Produção registrada com sucesso! ' || quantidade_param || ' unidades adicionadas ao estoque.';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 6: RLS para producoes
ALTER TABLE producoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver suas produções" ON producoes;
CREATE POLICY "Usuários podem ver suas produções"
  ON producoes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar produções" ON producoes;
CREATE POLICY "Usuários podem criar produções"
  ON producoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PASSO 7: RLS para historico_estoque
ALTER TABLE historico_estoque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seu histórico" ON historico_estoque;
CREATE POLICY "Usuários podem ver seu histórico"
  ON historico_estoque FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar histórico" ON historico_estoque;
CREATE POLICY "Usuários podem criar histórico"
  ON historico_estoque FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PASSO 8: Notificar PostgREST para recarregar schema
NOTIFY pgrst, 'reload schema';

-- PASSO 9: Verificação
SELECT 
  'Função criada com sucesso!' as status,
  proname as funcao,
  pg_get_function_arguments(oid) as parametros
FROM pg_proc
WHERE proname = 'registrar_producao';

-- PASSO 10: Testar a estrutura
SELECT 
  'Tabelas verificadas!' as status,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as total_colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('ingredientes', 'receitas', 'producoes', 'historico_estoque')
ORDER BY table_name;

