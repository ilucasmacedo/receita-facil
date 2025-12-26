-- ========================================
-- CORREÇÃO: SISTEMA DE VENDAS E ESTOQUE
-- ========================================
-- Execute este SQL no Editor SQL do Supabase

-- PASSO 1: Verificar e criar tabelas que faltam
CREATE TABLE IF NOT EXISTS vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  custo_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  lucro_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  cliente_nome TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'concluida',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_venda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE NOT NULL,
  receita_id UUID REFERENCES receitas(id) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  custo_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  lucro DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historico_estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
  tipo_movimentacao TEXT NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  quantidade_anterior DECIMAL(10,2),
  quantidade_nova DECIMAL(10,2),
  venda_id UUID REFERENCES vendas(id),
  observacao TEXT,
  data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 2: Remover funções e triggers antigos
DROP TRIGGER IF EXISTS trigger_venda_concluida ON vendas;
DROP FUNCTION IF EXISTS trigger_deduzir_estoque();
DROP FUNCTION IF EXISTS deduzir_estoque_venda(UUID);

-- PASSO 3: Criar função MELHORADA para deduzir estoque
CREATE OR REPLACE FUNCTION deduzir_estoque_venda(venda_id_param UUID)
RETURNS TABLE(
  ingrediente_nome TEXT,
  quantidade_deduzida DECIMAL,
  quantidade_anterior DECIMAL,
  quantidade_nova DECIMAL
) AS $$
DECLARE
  item RECORD;
  ingrediente_item RECORD;
  quantidade_necessaria DECIMAL;
  quantidade_ant DECIMAL;
  quantidade_nov DECIMAL;
  user_id_venda UUID;
BEGIN
  -- Buscar user_id da venda
  SELECT user_id INTO user_id_venda FROM vendas WHERE id = venda_id_param;
  
  -- Para cada item da venda
  FOR item IN 
    SELECT iv.*, r.rendimento_porcoes
    FROM itens_venda iv
    INNER JOIN receitas r ON iv.receita_id = r.id
    WHERE iv.venda_id = venda_id_param
  LOOP
    RAISE NOTICE 'Processando item: receita_id=%, quantidade=%, rendimento=%', 
      item.receita_id, item.quantidade, item.rendimento_porcoes;
    
    -- Para cada ingrediente da receita
    FOR ingrediente_item IN
      SELECT ir.ingrediente_id, ir.quantidade_usada, i.nome, i.quantidade_total, i.unidade
      FROM itens_receita ir
      INNER JOIN ingredientes i ON ir.ingrediente_id = i.id
      WHERE ir.receita_id = item.receita_id
    LOOP
      -- Calcular quantidade necessária
      -- Se a receita rende 10 e vendemos 5, usamos metade dos ingredientes
      quantidade_necessaria := (ingrediente_item.quantidade_usada / item.rendimento_porcoes) * item.quantidade;
      
      RAISE NOTICE 'Ingrediente: %, Quantidade usada na receita: %, Necessária: %', 
        ingrediente_item.nome, ingrediente_item.quantidade_usada, quantidade_necessaria;
      
      -- Guardar quantidade anterior
      quantidade_ant := ingrediente_item.quantidade_total;
      quantidade_nov := quantidade_ant - quantidade_necessaria;
      
      -- Deduzir do estoque
      UPDATE ingredientes
      SET quantidade_total = quantidade_nov
      WHERE id = ingrediente_item.ingrediente_id;
      
      -- Registrar no histórico
      INSERT INTO historico_estoque (
        user_id,
        ingrediente_id,
        tipo_movimentacao,
        quantidade,
        quantidade_anterior,
        quantidade_nova,
        venda_id,
        observacao,
        data_movimentacao
      ) VALUES (
        user_id_venda,
        ingrediente_item.ingrediente_id,
        'saida_venda',
        quantidade_necessaria,
        quantidade_ant,
        quantidade_nov,
        venda_id_param,
        'Dedução automática por venda',
        NOW()
      );
      
      -- Retornar informações
      ingrediente_nome := ingrediente_item.nome;
      quantidade_deduzida := quantidade_necessaria;
      quantidade_anterior := quantidade_ant;
      quantidade_nova := quantidade_nov;
      RETURN NEXT;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- PASSO 4: Criar trigger para deduzir estoque automaticamente
CREATE OR REPLACE FUNCTION trigger_deduzir_estoque()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Trigger disparado para venda: %, status: %', NEW.id, NEW.status;
  
  -- Deduzir estoque apenas se a venda foi concluída
  IF NEW.status = 'concluida' THEN
    RAISE NOTICE 'Deduzindo estoque...';
    PERFORM deduzir_estoque_venda(NEW.id);
    RAISE NOTICE 'Estoque deduzido com sucesso!';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_venda_concluida
  AFTER INSERT ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_deduzir_estoque();

-- PASSO 5: Criar/Atualizar RLS
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_estoque ENABLE ROW LEVEL SECURITY;

-- Vendas
DROP POLICY IF EXISTS "Usuários podem ver suas vendas" ON vendas;
CREATE POLICY "Usuários podem ver suas vendas"
  ON vendas FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar vendas" ON vendas;
CREATE POLICY "Usuários podem criar vendas"
  ON vendas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas vendas" ON vendas;
CREATE POLICY "Usuários podem atualizar suas vendas"
  ON vendas FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas vendas" ON vendas;
CREATE POLICY "Usuários podem deletar suas vendas"
  ON vendas FOR DELETE
  USING (auth.uid() = user_id);

-- Itens Venda
DROP POLICY IF EXISTS "Usuários podem ver itens de suas vendas" ON itens_venda;
CREATE POLICY "Usuários podem ver itens de suas vendas"
  ON itens_venda FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM vendas WHERE vendas.id = itens_venda.venda_id AND vendas.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Usuários podem criar itens de venda" ON itens_venda;
CREATE POLICY "Usuários podem criar itens de venda"
  ON itens_venda FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM vendas WHERE vendas.id = itens_venda.venda_id AND vendas.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Usuários podem atualizar itens de suas vendas" ON itens_venda;
CREATE POLICY "Usuários podem atualizar itens de suas vendas"
  ON itens_venda FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM vendas WHERE vendas.id = itens_venda.venda_id AND vendas.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Usuários podem deletar itens de suas vendas" ON itens_venda;
CREATE POLICY "Usuários podem deletar itens de suas vendas"
  ON itens_venda FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM vendas WHERE vendas.id = itens_venda.venda_id AND vendas.user_id = auth.uid()
  ));

-- Histórico Estoque
DROP POLICY IF EXISTS "Usuários podem ver seu histórico" ON historico_estoque;
CREATE POLICY "Usuários podem ver seu histórico"
  ON historico_estoque FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar histórico" ON historico_estoque;
CREATE POLICY "Usuários podem criar histórico"
  ON historico_estoque FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sistema pode criar histórico" ON historico_estoque;
CREATE POLICY "Sistema pode criar histórico"
  ON historico_estoque FOR INSERT
  WITH CHECK (true);

-- PASSO 6: Criar view de estoque
CREATE OR REPLACE VIEW estoque_atual AS
SELECT 
  i.id,
  i.user_id,
  i.nome,
  i.quantidade_total as quantidade_atual,
  i.unidade,
  i.preco_compra,
  (i.preco_compra / NULLIF(i.quantidade_total, 0)) as custo_unitario,
  i.tipo_origem,
  COALESCE(
    (SELECT COUNT(*) 
     FROM itens_receita ir 
     WHERE ir.ingrediente_id = i.id),
    0
  ) as usado_em_receitas,
  COALESCE(
    (SELECT SUM(h.quantidade)
     FROM historico_estoque h
     WHERE h.ingrediente_id = i.id 
     AND h.tipo_movimentacao = 'entrada_compra'),
    0
  ) as total_entradas,
  COALESCE(
    (SELECT SUM(h.quantidade)
     FROM historico_estoque h
     WHERE h.ingrediente_id = i.id 
     AND h.tipo_movimentacao = 'saida_venda'),
    0
  ) as total_saidas
FROM ingredientes i;

-- PASSO 7: Notificar PostgREST
NOTIFY pgrst, 'reload schema';

-- PASSO 8: Verificar criação
SELECT 
  'Configuração concluída!' as status,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('vendas', 'itens_venda', 'historico_estoque')
ORDER BY table_name;

-- PASSO 9: Verificar função
SELECT 
  'Função criada!' as status,
  proname as funcao
FROM pg_proc
WHERE proname = 'deduzir_estoque_venda';

-- PASSO 10: Verificar trigger
SELECT 
  'Trigger criado!' as status,
  tgname as trigger
FROM pg_trigger
WHERE tgname = 'trigger_venda_concluida';

