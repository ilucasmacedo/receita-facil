-- ========================================
-- SISTEMA DE VENDAS COM CONTROLE DE ESTOQUE
-- ========================================
-- Execute este SQL no Editor SQL do Supabase

-- PASSO 1: Criar tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  custo_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  lucro_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  cliente_nome TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'concluida', -- concluida, cancelada, pendente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 2: Criar tabela de itens da venda
CREATE TABLE IF NOT EXISTS itens_venda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE NOT NULL,
  receita_id UUID REFERENCES receitas(id) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL, -- Preço real de venda
  custo_unitario DECIMAL(10,2) NOT NULL, -- Custo da receita
  subtotal DECIMAL(10,2) NOT NULL, -- quantidade * preco_unitario
  lucro DECIMAL(10,2) NOT NULL, -- (preco_unitario - custo_unitario) * quantidade
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 3: Função para deduzir ingredientes do estoque
CREATE OR REPLACE FUNCTION deduzir_estoque_venda(venda_id_param UUID)
RETURNS VOID AS $$
DECLARE
  item RECORD;
  ingrediente_item RECORD;
  quantidade_necessaria DECIMAL;
BEGIN
  -- Para cada item da venda
  FOR item IN 
    SELECT iv.*, r.rendimento_porcoes
    FROM itens_venda iv
    INNER JOIN receitas r ON iv.receita_id = r.id
    WHERE iv.venda_id = venda_id_param
  LOOP
    -- Para cada ingrediente da receita
    FOR ingrediente_item IN
      SELECT ir.ingrediente_id, ir.quantidade_usada
      FROM itens_receita ir
      WHERE ir.receita_id = item.receita_id
    LOOP
      -- Calcular quantidade necessária por unidade vendida
      -- Se a receita rende 10 porções e vendemos 5, usamos metade dos ingredientes
      quantidade_necessaria := (ingrediente_item.quantidade_usada / item.rendimento_porcoes) * item.quantidade;
      
      -- Deduzir do estoque
      UPDATE ingredientes
      SET quantidade_total = quantidade_total - quantidade_necessaria
      WHERE id = ingrediente_item.ingrediente_id;
      
      -- Registrar no histórico (para auditoria)
      INSERT INTO historico_estoque (
        user_id,
        ingrediente_id,
        tipo_movimentacao,
        quantidade,
        venda_id,
        data_movimentacao
      )
      SELECT 
        v.user_id,
        ingrediente_item.ingrediente_id,
        'saida_venda',
        quantidade_necessaria,
        venda_id_param,
        NOW()
      FROM vendas v
      WHERE v.id = venda_id_param;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- PASSO 4: Criar tabela de histórico de estoque (para auditoria)
CREATE TABLE IF NOT EXISTS historico_estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
  tipo_movimentacao TEXT NOT NULL, -- entrada_compra, saida_venda, ajuste_manual
  quantidade DECIMAL(10,2) NOT NULL,
  venda_id UUID REFERENCES vendas(id),
  observacao TEXT,
  data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 5: Trigger para deduzir estoque automaticamente após inserir venda
CREATE OR REPLACE FUNCTION trigger_deduzir_estoque()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduzir estoque apenas se a venda foi concluída
  IF NEW.status = 'concluida' THEN
    PERFORM deduzir_estoque_venda(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_venda_concluida ON vendas;
CREATE TRIGGER trigger_venda_concluida
  AFTER INSERT ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_deduzir_estoque();

-- PASSO 6: Criar RLS (Row Level Security) para vendas
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_estoque ENABLE ROW LEVEL SECURITY;

-- Políticas para vendas
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

-- Políticas para itens_venda
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

-- Políticas para historico_estoque
DROP POLICY IF EXISTS "Usuários podem ver seu histórico" ON historico_estoque;
CREATE POLICY "Usuários podem ver seu histórico"
  ON historico_estoque FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar histórico" ON historico_estoque;
CREATE POLICY "Usuários podem criar histórico"
  ON historico_estoque FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PASSO 7: Criar view para relatórios de vendas
CREATE OR REPLACE VIEW vendas_detalhadas AS
SELECT 
  v.*,
  COUNT(iv.id) as total_itens,
  json_agg(
    json_build_object(
      'receita_nome', r.nome,
      'quantidade', iv.quantidade,
      'preco_unitario', iv.preco_unitario,
      'subtotal', iv.subtotal,
      'lucro', iv.lucro
    )
  ) as itens
FROM vendas v
LEFT JOIN itens_venda iv ON v.id = iv.venda_id
LEFT JOIN receitas r ON iv.receita_id = r.id
GROUP BY v.id;

-- PASSO 8: Notificar o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';

-- PASSO 9: Verificar se as tabelas foram criadas
SELECT 
  'Tabelas criadas com sucesso!' as status,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('vendas', 'itens_venda', 'historico_estoque')
ORDER BY table_name;

