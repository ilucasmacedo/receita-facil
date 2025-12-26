-- ========================================
-- ADICIONAR ESTOQUE MÍNIMO E ALERTAS
-- ========================================

-- PASSO 1: Adicionar coluna estoque_minimo
ALTER TABLE ingredientes 
ADD COLUMN IF NOT EXISTS estoque_minimo DECIMAL(10,2) DEFAULT 0;

-- PASSO 2: Atualizar estoque_minimo padrão baseado na unidade
UPDATE ingredientes
SET estoque_minimo = CASE 
  WHEN unidade = 'g' THEN 100
  WHEN unidade = 'kg' THEN 0.5
  WHEN unidade = 'ml' THEN 100
  WHEN unidade = 'L' THEN 0.5
  WHEN unidade = 'un' THEN 5
  ELSE 10
END
WHERE estoque_minimo = 0;

-- PASSO 3: Criar view para alertas de estoque
CREATE OR REPLACE VIEW alertas_estoque AS
SELECT 
  i.id,
  i.user_id,
  i.nome,
  i.quantidade_total as quantidade_atual,
  i.estoque_minimo,
  i.unidade,
  CASE 
    WHEN i.quantidade_total <= 0 THEN 'sem_estoque'
    WHEN i.quantidade_total <= i.estoque_minimo THEN 'estoque_baixo'
    ELSE 'ok'
  END as status,
  (i.preco_compra / NULLIF(i.quantidade_total, 0)) as custo_unitario
FROM ingredientes i;

-- PASSO 4: Notificar PostgREST
NOTIFY pgrst, 'reload schema';

-- PASSO 5: Verificar
SELECT 
  'Coluna adicionada!' as status,
  COUNT(*) as total_ingredientes,
  COUNT(*) FILTER (WHERE estoque_minimo > 0) as com_estoque_minimo
FROM ingredientes;

