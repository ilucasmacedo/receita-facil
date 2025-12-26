-- ========================================
-- ESTOQUE MÍNIMO - INSUMOS
-- ========================================
-- Execute este SQL para adicionar controle de estoque mínimo

-- PASSO 1: Adicionar coluna estoque_minimo aos ingredientes (insumos)
ALTER TABLE ingredientes 
ADD COLUMN IF NOT EXISTS estoque_minimo DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN ingredientes.estoque_minimo IS 'Alerta quando a quantidade_total estiver abaixo deste valor';

-- PASSO 2: Adicionar estoque_atual (se ainda não existir)
-- Nota: quantidade_total já funciona como estoque_atual, mas vamos garantir
ALTER TABLE ingredientes 
ADD COLUMN IF NOT EXISTS estoque_atual DECIMAL(10,2);

-- Copiar valores de quantidade_total para estoque_atual (se a coluna foi criada vazia)
UPDATE ingredientes
SET estoque_atual = quantidade_total
WHERE estoque_atual IS NULL;

-- PASSO 3: Atualizar estoque_minimo com valores padrão inteligentes
UPDATE ingredientes
SET estoque_minimo = CASE 
  WHEN unidade = 'g' THEN 100      -- 100g mínimo
  WHEN unidade = 'kg' THEN 0.5     -- 500g mínimo (convertido)
  WHEN unidade = 'ml' THEN 100     -- 100ml mínimo
  WHEN unidade = 'L' THEN 0.5      -- 500ml mínimo (convertido)
  WHEN unidade = 'un' THEN 5       -- 5 unidades mínimo
  ELSE 10
END
WHERE estoque_minimo = 0 OR estoque_minimo IS NULL;

-- PASSO 4: Criar view para alertas de estoque de insumos
DROP VIEW IF EXISTS alertas_estoque_insumos;

CREATE OR REPLACE VIEW alertas_estoque_insumos AS
SELECT 
  i.id,
  i.user_id,
  i.nome,
  i.quantidade_total as quantidade_atual,
  i.estoque_minimo,
  i.unidade,
  CASE 
    WHEN i.quantidade_total <= 0 THEN 'sem_estoque'
    WHEN i.estoque_minimo > 0 AND i.quantidade_total <= i.estoque_minimo THEN 'estoque_baixo'
    ELSE 'ok'
  END as status,
  CASE 
    WHEN i.quantidade_total <= 0 THEN 'Comprar urgente!'
    WHEN i.estoque_minimo > 0 AND i.quantidade_total <= i.estoque_minimo THEN 'Reabastecer em breve'
    ELSE 'Estoque OK'
  END as alerta,
  (i.preco_compra / NULLIF(i.quantidade_total, 0)) as custo_unitario,
  i.preco_compra as valor_ultima_compra,
  i.created_at,
  i.tipo_origem
FROM ingredientes i
ORDER BY 
  CASE 
    WHEN i.quantidade_total <= 0 THEN 1
    WHEN i.estoque_minimo > 0 AND i.quantidade_total <= i.estoque_minimo THEN 2
    ELSE 3
  END,
  i.nome;

COMMENT ON VIEW alertas_estoque_insumos IS 'Lista todos os insumos com status de estoque e alertas';

-- PASSO 5: Criar view para alertas de produtos prontos
DROP VIEW IF EXISTS alertas_estoque_produtos;

CREATE OR REPLACE VIEW alertas_estoque_produtos AS
SELECT 
  r.id,
  r.user_id,
  r.nome,
  r.quantidade_em_estoque as quantidade_atual,
  r.estoque_minimo_produtos as estoque_minimo,
  'un' as unidade,
  CASE 
    WHEN r.quantidade_em_estoque <= 0 THEN 'sem_estoque'
    WHEN r.estoque_minimo_produtos > 0 AND r.quantidade_em_estoque <= r.estoque_minimo_produtos THEN 'estoque_baixo'
    ELSE 'ok'
  END as status,
  CASE 
    WHEN r.quantidade_em_estoque <= 0 THEN 'Produzir urgente!'
    WHEN r.estoque_minimo_produtos > 0 AND r.quantidade_em_estoque <= r.estoque_minimo_produtos THEN 'Produzir em breve'
    ELSE 'Estoque OK'
  END as alerta,
  r.custo_total,
  r.preco_venda,
  (r.preco_venda - r.custo_total) as lucro_por_unidade,
  r.foto_url
FROM receitas r
WHERE r.quantidade_em_estoque IS NOT NULL
ORDER BY 
  CASE 
    WHEN r.quantidade_em_estoque <= 0 THEN 1
    WHEN r.estoque_minimo_produtos > 0 AND r.quantidade_em_estoque <= r.estoque_minimo_produtos THEN 2
    ELSE 3
  END,
  r.nome;

COMMENT ON VIEW alertas_estoque_produtos IS 'Lista todos os produtos prontos com status de estoque e alertas';

-- PASSO 6: Criar função para contar alertas
CREATE OR REPLACE FUNCTION contar_alertas_estoque(user_id_param UUID)
RETURNS TABLE(
  insumos_sem_estoque BIGINT,
  insumos_baixo BIGINT,
  produtos_sem_estoque BIGINT,
  produtos_baixo BIGINT,
  total_alertas BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM ingredientes WHERE user_id = user_id_param AND quantidade_total <= 0),
    (SELECT COUNT(*) FROM ingredientes WHERE user_id = user_id_param AND estoque_minimo > 0 AND quantidade_total > 0 AND quantidade_total <= estoque_minimo),
    (SELECT COUNT(*) FROM receitas WHERE user_id = user_id_param AND quantidade_em_estoque <= 0),
    (SELECT COUNT(*) FROM receitas WHERE user_id = user_id_param AND estoque_minimo_produtos > 0 AND quantidade_em_estoque > 0 AND quantidade_em_estoque <= estoque_minimo_produtos),
    (SELECT COUNT(*) FROM ingredientes WHERE user_id = user_id_param AND (quantidade_total <= 0 OR (estoque_minimo > 0 AND quantidade_total <= estoque_minimo)))
    +
    (SELECT COUNT(*) FROM receitas WHERE user_id = user_id_param AND (quantidade_em_estoque <= 0 OR (estoque_minimo_produtos > 0 AND quantidade_em_estoque <= estoque_minimo_produtos)));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION contar_alertas_estoque IS 'Retorna contagem de alertas de estoque para o dashboard';

-- PASSO 7: RLS para as views
ALTER VIEW alertas_estoque_insumos SET (security_invoker = on);
ALTER VIEW alertas_estoque_produtos SET (security_invoker = on);

-- PASSO 8: Notificar PostgREST
NOTIFY pgrst, 'reload schema';

-- PASSO 9: Verificação
SELECT 
  '✅ ESTOQUE MÍNIMO CONFIGURADO' as status;

-- Verificar colunas
SELECT 
  '✅ Colunas de Ingredientes' as tipo,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'ingredientes'
AND column_name IN ('estoque_minimo', 'estoque_atual', 'quantidade_total')
ORDER BY column_name;

-- Verificar colunas de receitas
SELECT 
  '✅ Colunas de Receitas' as tipo,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'receitas'
AND column_name IN ('quantidade_em_estoque', 'estoque_minimo_produtos')
ORDER BY column_name;

-- Estatísticas de insumos
SELECT 
  '📊 ESTATÍSTICAS DE INSUMOS' as status,
  COUNT(*) as total_insumos,
  COUNT(*) FILTER (WHERE estoque_minimo > 0) as com_estoque_minimo_definido,
  COUNT(*) FILTER (WHERE quantidade_total <= 0) as sem_estoque,
  COUNT(*) FILTER (WHERE estoque_minimo > 0 AND quantidade_total > 0 AND quantidade_total <= estoque_minimo) as estoque_baixo
FROM ingredientes;

-- Verificar views
SELECT 
  '✅ VIEWS CRIADAS' as status,
  viewname
FROM pg_views
WHERE viewname IN ('alertas_estoque_insumos', 'alertas_estoque_produtos');

-- Verificar função
SELECT 
  '✅ FUNÇÃO CRIADA' as status,
  proname as funcao
FROM pg_proc
WHERE proname = 'contar_alertas_estoque';

-- Mensagem final
SELECT 
  '🎉 TUDO PRONTO!' as status,
  'Sistema de estoque mínimo configurado com sucesso!' as mensagem;

