-- ================================================
-- CRIAR ESTRUTURA DO ZERO
-- ================================================
-- Execute DEPOIS de SQL_DELETAR_TUDO_AGORA.sql

-- ================================================
-- TABELAS
-- ================================================

-- 1. Ingredientes (Insumos)
CREATE TABLE ingredientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_total DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL CHECK (unidade IN ('g', 'kg', 'ml', 'L', 'un')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo_origem TEXT DEFAULT 'comprado' CHECK (tipo_origem IN ('comprado', 'producao_propria')),
  receita_origem_id UUID,
  unidade_producao TEXT,
  quantidade_por_receita DECIMAL(10,2),
  estoque_atual DECIMAL(10,2) DEFAULT 0,
  estoque_minimo DECIMAL(10,2) DEFAULT 0
);

-- 2. Receitas (Modelos)
CREATE TABLE receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  foto_url TEXT,
  descricao TEXT,
  rendimento_porcoes INT DEFAULT 1,
  tempo_preparo_minutos INT,
  margem_lucro_desejada DECIMAL(10,2) DEFAULT 100,
  custo_total DECIMAL(10,2),
  preco_venda DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_atualizacao_custos TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requer_atualizacao BOOLEAN DEFAULT TRUE,
  quantidade_em_estoque DECIMAL(10,2) DEFAULT 0,
  estoque_minimo_produtos DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  tipo VARCHAR(255)
);

-- Adicionar foreign key depois que receitas existe
ALTER TABLE ingredientes 
ADD CONSTRAINT fk_receita_origem 
FOREIGN KEY (receita_origem_id) 
REFERENCES receitas(id) 
ON DELETE SET NULL;

-- 3. Itens de Receita
CREATE TABLE itens_receita (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID REFERENCES receitas ON DELETE CASCADE,
  ingrediente_id UUID REFERENCES ingredientes,
  quantidade_usada DECIMAL(10,2) NOT NULL
);

-- 4. Histórico de Compras
CREATE TABLE historico_compras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingrediente_id UUID REFERENCES ingredientes ON DELETE CASCADE,
  preco_pago DECIMAL(10,2) NOT NULL,
  quantidade_comprada DECIMAL(10,2) NOT NULL,
  data_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Vendas
CREATE TABLE vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valor_total DECIMAL(10,2) NOT NULL,
  observacoes TEXT
);

-- 6. Itens de Venda
CREATE TABLE itens_venda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES vendas ON DELETE CASCADE,
  receita_id UUID REFERENCES receitas,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- 7. Produções
CREATE TABLE producoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  receita_id UUID REFERENCES receitas,
  quantidade_produzida INT NOT NULL,
  data_producao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Histórico de Estoque
CREATE TABLE historico_estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ingrediente_id UUID REFERENCES ingredientes,
  tipo_movimento TEXT CHECK (tipo_movimento IN ('entrada', 'saida', 'ajuste')),
  quantidade_anterior DECIMAL(10,2),
  quantidade_movimentada DECIMAL(10,2) NOT NULL,
  quantidade_nova DECIMAL(10,2),
  motivo TEXT,
  data_movimento TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- RLS (Row Level Security)
-- ================================================

ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_receita ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE producoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_estoque ENABLE ROW LEVEL SECURITY;

-- Políticas: ingredientes
CREATE POLICY "Usuários veem seus ingredientes" ON ingredientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários inserem ingredientes" ON ingredientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam ingredientes" ON ingredientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam ingredientes" ON ingredientes FOR DELETE USING (auth.uid() = user_id);

-- Políticas: receitas
CREATE POLICY "Usuários veem suas receitas" ON receitas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários inserem receitas" ON receitas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam receitas" ON receitas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam receitas" ON receitas FOR DELETE USING (auth.uid() = user_id);

-- Políticas: itens_receita
CREATE POLICY "Usuários veem itens de suas receitas" ON itens_receita FOR SELECT USING (
  EXISTS (SELECT 1 FROM receitas WHERE receitas.id = itens_receita.receita_id AND receitas.user_id = auth.uid())
);
CREATE POLICY "Usuários inserem itens" ON itens_receita FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM receitas WHERE receitas.id = itens_receita.receita_id AND receitas.user_id = auth.uid())
);
CREATE POLICY "Usuários atualizam itens" ON itens_receita FOR UPDATE USING (
  EXISTS (SELECT 1 FROM receitas WHERE receitas.id = itens_receita.receita_id AND receitas.user_id = auth.uid())
);
CREATE POLICY "Usuários deletam itens" ON itens_receita FOR DELETE USING (
  EXISTS (SELECT 1 FROM receitas WHERE receitas.id = itens_receita.receita_id AND receitas.user_id = auth.uid())
);

-- Políticas: historico_compras
CREATE POLICY "Usuários veem seu histórico" ON historico_compras FOR SELECT USING (
  EXISTS (SELECT 1 FROM ingredientes WHERE ingredientes.id = historico_compras.ingrediente_id AND ingredientes.user_id = auth.uid())
);
CREATE POLICY "Usuários inserem histórico" ON historico_compras FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ingredientes WHERE ingredientes.id = historico_compras.ingrediente_id AND ingredientes.user_id = auth.uid())
);

-- Políticas: vendas
CREATE POLICY "Usuários veem suas vendas" ON vendas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários inserem vendas" ON vendas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam vendas" ON vendas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam vendas" ON vendas FOR DELETE USING (auth.uid() = user_id);

-- Políticas: itens_venda
CREATE POLICY "Usuários veem itens de suas vendas" ON itens_venda FOR SELECT USING (
  EXISTS (SELECT 1 FROM vendas WHERE vendas.id = itens_venda.venda_id AND vendas.user_id = auth.uid())
);
CREATE POLICY "Usuários inserem itens de venda" ON itens_venda FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM vendas WHERE vendas.id = itens_venda.venda_id AND vendas.user_id = auth.uid())
);

-- Políticas: producoes
CREATE POLICY "Usuários veem suas produções" ON producoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários inserem produções" ON producoes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas: historico_estoque
CREATE POLICY "Usuários veem seu histórico de estoque" ON historico_estoque FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários inserem histórico de estoque" ON historico_estoque FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================
-- FUNÇÕES
-- ================================================

-- Função: Recalcular custo da receita
CREATE OR REPLACE FUNCTION recalcular_custo_receita(receita_id_param UUID)
RETURNS TABLE(custo_total_calculado DECIMAL, preco_venda_calculado DECIMAL) AS $$
DECLARE
  custo_total_var DECIMAL := 0;
  preco_venda_var DECIMAL := 0;
  margem_lucro_var DECIMAL;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN i.tipo_origem = 'producao_propria' THEN
        (ir.quantidade_usada / NULLIF(i.quantidade_por_receita, 0)) * COALESCE(r_origem.custo_total, 0)
      ELSE
        (ir.quantidade_usada / NULLIF(i.quantidade_total, 0)) * i.preco_compra
    END
  ), 0)
  INTO custo_total_var
  FROM itens_receita ir
  JOIN ingredientes i ON ir.ingrediente_id = i.id
  LEFT JOIN receitas r_origem ON i.receita_origem_id = r_origem.id
  WHERE ir.receita_id = receita_id_param;

  SELECT margem_lucro_desejada INTO margem_lucro_var
  FROM receitas
  WHERE id = receita_id_param;

  preco_venda_var := custo_total_var * (1 + margem_lucro_var / 100);

  RETURN QUERY SELECT custo_total_var, preco_venda_var;
END;
$$ LANGUAGE plpgsql;

-- Função: Marcar receitas para atualização
CREATE OR REPLACE FUNCTION marcar_receitas_para_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE receitas
  SET requer_atualizacao = TRUE,
      ultima_atualizacao_custos = NOW()
  WHERE id IN (
    SELECT DISTINCT receita_id
    FROM itens_receita
    WHERE ingrediente_id = NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função: Registrar produção
CREATE OR REPLACE FUNCTION registrar_producao(
  p_receita_id UUID,
  p_quantidade INT
)
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
  v_ingrediente RECORD;
  v_quantidade_necessaria DECIMAL;
BEGIN
  SELECT user_id INTO v_user_id FROM receitas WHERE id = p_receita_id;

  FOR v_ingrediente IN
    SELECT ir.ingrediente_id, ir.quantidade_usada, i.estoque_atual, i.nome
    FROM itens_receita ir
    JOIN ingredientes i ON ir.ingrediente_id = i.id
    WHERE ir.receita_id = p_receita_id
  LOOP
    v_quantidade_necessaria := v_ingrediente.quantidade_usada * p_quantidade;

    IF v_ingrediente.estoque_atual < v_quantidade_necessaria THEN
      RETURN 'ERRO: Estoque insuficiente de ' || v_ingrediente.nome;
    END IF;
  END LOOP;

  FOR v_ingrediente IN
    SELECT ir.ingrediente_id, ir.quantidade_usada, i.estoque_atual
    FROM itens_receita ir
    JOIN ingredientes i ON ir.ingrediente_id = i.id
    WHERE ir.receita_id = p_receita_id
  LOOP
    v_quantidade_necessaria := v_ingrediente.quantidade_usada * p_quantidade;

    UPDATE ingredientes
    SET estoque_atual = estoque_atual - v_quantidade_necessaria
    WHERE id = v_ingrediente.ingrediente_id;

    INSERT INTO historico_estoque (user_id, ingrediente_id, tipo_movimento, quantidade_anterior, quantidade_movimentada, quantidade_nova, motivo)
    VALUES (v_user_id, v_ingrediente.ingrediente_id, 'saida', v_ingrediente.estoque_atual, v_quantidade_necessaria, v_ingrediente.estoque_atual - v_quantidade_necessaria, 'Produção');
  END LOOP;

  UPDATE receitas
  SET quantidade_em_estoque = quantidade_em_estoque + p_quantidade
  WHERE id = p_receita_id;

  INSERT INTO producoes (user_id, receita_id, quantidade_produzida)
  VALUES (v_user_id, p_receita_id, p_quantidade);

  RETURN 'OK';
END;
$$ LANGUAGE plpgsql;

-- Função: Deduzir estoque em vendas
CREATE OR REPLACE FUNCTION deduzir_estoque_venda_produtos()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  estoque_atual_var DECIMAL;
BEGIN
  FOR item IN
    SELECT receita_id, quantidade
    FROM itens_venda
    WHERE venda_id = NEW.id
  LOOP
    SELECT quantidade_em_estoque INTO estoque_atual_var
    FROM receitas
    WHERE id = item.receita_id;

    IF estoque_atual_var < item.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente para receita ID: %', item.receita_id;
    END IF;

    UPDATE receitas
    SET quantidade_em_estoque = quantidade_em_estoque - item.quantidade
    WHERE id = item.receita_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS
-- ================================================

CREATE TRIGGER trigger_ingrediente_alterado
AFTER UPDATE OF preco_compra, quantidade_total, tipo_origem ON ingredientes
FOR EACH ROW
EXECUTE FUNCTION marcar_receitas_para_atualizacao();

CREATE TRIGGER trigger_deduzir_estoque_venda
AFTER INSERT ON vendas
FOR EACH ROW
EXECUTE FUNCTION deduzir_estoque_venda_produtos();

-- ================================================
-- VIEWS
-- ================================================

CREATE VIEW receitas_desativadas AS
SELECT * FROM receitas WHERE ativo = FALSE;

CREATE VIEW alertas_estoque_insumos AS
SELECT
  id,
  nome,
  estoque_atual,
  estoque_minimo,
  CASE
    WHEN estoque_atual = 0 THEN 'SEM_ESTOQUE'
    WHEN estoque_atual < estoque_minimo THEN 'BAIXO'
    ELSE 'OK'
  END AS status
FROM ingredientes;

CREATE VIEW alertas_estoque_produtos AS
SELECT
  id,
  nome,
  quantidade_em_estoque,
  estoque_minimo_produtos,
  CASE
    WHEN quantidade_em_estoque = 0 THEN 'SEM_ESTOQUE'
    WHEN quantidade_em_estoque < estoque_minimo_produtos THEN 'BAIXO'
    ELSE 'OK'
  END AS status
FROM receitas;

-- ================================================
-- ÍNDICES (Performance)
-- ================================================

CREATE INDEX idx_ingredientes_user_id ON ingredientes(user_id);
CREATE INDEX idx_receitas_user_id ON receitas(user_id);
CREATE INDEX idx_receitas_tipo ON receitas(tipo);
CREATE INDEX idx_itens_receita_receita_id ON itens_receita(receita_id);
CREATE INDEX idx_itens_receita_ingrediente_id ON itens_receita(ingrediente_id);
CREATE INDEX idx_vendas_user_id ON vendas(user_id);
CREATE INDEX idx_vendas_data ON vendas(data_venda);

-- ================================================
-- NOTIFICAR POSTGREST
-- ================================================

NOTIFY pgrst, 'reload schema';

-- ================================================
-- VERIFICAÇÃO
-- ================================================

SELECT 'ESTRUTURA CRIADA COM SUCESSO!' AS status;

SELECT 'Tabelas' AS tipo, COUNT(*) AS quantidade
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 'Funções', COUNT(*)
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
UNION ALL
SELECT 'Triggers', COUNT(*)
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- ✅ PRONTO! Banco zerado e estrutura criada!

