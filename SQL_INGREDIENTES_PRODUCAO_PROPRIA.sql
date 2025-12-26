-- SQL: Sistema de Ingredientes de Produção Própria
-- Permite usar receitas como ingredientes em outras receitas

-- 1. Adicionar campos na tabela ingredientes
ALTER TABLE ingredientes 
ADD COLUMN IF NOT EXISTS tipo_origem TEXT DEFAULT 'comprado' CHECK (tipo_origem IN ('comprado', 'producao_propria')),
ADD COLUMN IF NOT EXISTS receita_origem_id UUID REFERENCES receitas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS unidade_producao TEXT,
ADD COLUMN IF NOT EXISTS quantidade_por_receita DECIMAL(10,2);

-- 2. Comentários explicativos
COMMENT ON COLUMN ingredientes.tipo_origem IS 'comprado = ingrediente comprado no mercado, producao_propria = feito a partir de uma receita';
COMMENT ON COLUMN ingredientes.receita_origem_id IS 'ID da receita que gera este ingrediente (se for produção própria)';
COMMENT ON COLUMN ingredientes.unidade_producao IS 'Unidade que a receita produz (ex: 1 bolo, 12 cupcakes, 500g)';
COMMENT ON COLUMN ingredientes.quantidade_por_receita IS 'Quantidade que a receita produz';

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_ingredientes_receita_origem 
  ON ingredientes(receita_origem_id) 
  WHERE receita_origem_id IS NOT NULL;

-- 4. Criar view auxiliar para facilitar consultas
CREATE OR REPLACE VIEW ingredientes_com_receita AS
SELECT 
  i.*,
  r.nome as nome_receita_origem,
  r.custo_total as custo_receita_origem,
  r.rendimento_porcoes as rendimento_receita_origem,
  CASE 
    WHEN i.tipo_origem = 'producao_propria' AND i.quantidade_por_receita > 0 
    THEN r.custo_total / i.quantidade_por_receita
    ELSE i.preco_compra / NULLIF(i.quantidade_total, 0)
  END as custo_unitario_calculado
FROM ingredientes i
LEFT JOIN receitas r ON i.receita_origem_id = r.id;

COMMENT ON VIEW ingredientes_com_receita IS 'View que calcula automaticamente o custo unitário baseado na receita de origem';

-- 5. Criar função para atualizar custo de ingrediente quando receita muda
CREATE OR REPLACE FUNCTION atualizar_custo_ingrediente_producao()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar preco_compra dos ingredientes vinculados a esta receita
  UPDATE ingredientes
  SET 
    preco_compra = NEW.custo_total,
    quantidade_total = COALESCE(quantidade_por_receita, NEW.rendimento_porcoes)
  WHERE receita_origem_id = NEW.id
  AND tipo_origem = 'producao_propria';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para atualizar automaticamente
DROP TRIGGER IF EXISTS trigger_atualizar_custo_ingrediente ON receitas;
CREATE TRIGGER trigger_atualizar_custo_ingrediente
  AFTER INSERT OR UPDATE OF custo_total 
  ON receitas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_custo_ingrediente_producao();

-- 7. Recarregar schema
NOTIFY pgrst, 'reload schema';

-- 8. Exemplo de uso (comentado)
/*
-- Exemplo: Criar ingrediente "Bolo de Chocolate" a partir da receita

-- 1. Primeiro, você tem a receita de Bolo de Chocolate (id = 'xxx')
--    Custo: R$ 20,00
--    Rendimento: 1 bolo

-- 2. Criar ingrediente de produção própria:
INSERT INTO ingredientes (
  user_id,
  nome,
  tipo_origem,
  receita_origem_id,
  preco_compra,
  quantidade_total,
  unidade,
  unidade_producao,
  quantidade_por_receita
) VALUES (
  'seu_user_id',
  'Bolo de Chocolate (Produção Própria)',
  'producao_propria',
  'id_da_receita_bolo',
  20.00,  -- custo da receita
  1,      -- quantidade que a receita produz
  'un',   -- unidade
  '1 bolo inteiro',
  1       -- quantidade por receita
);

-- 3. Agora você pode usar este ingrediente em "Bolo de Pote"
--    O custo será R$ 20,00 por unidade (1 bolo)
--    Se a receita de Bolo de Chocolate mudar, o custo atualiza automaticamente!
*/

