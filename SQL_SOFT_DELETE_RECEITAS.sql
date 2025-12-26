-- ========================================
-- SOFT DELETE - DESATIVAR RECEITAS
-- ========================================
-- Em vez de deletar, marca como "inativa"
-- Mantém histórico de vendas intacto

-- PASSO 1: Adicionar coluna "ativo" às receitas
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN receitas.ativo IS 'FALSE = receita desativada (não aparece mais no app, mas mantém histórico)';

-- PASSO 2: Adicionar coluna "data_desativacao"
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS data_desativacao TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN receitas.data_desativacao IS 'Quando a receita foi desativada';

-- PASSO 3: Adicionar coluna "motivo_desativacao"
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS motivo_desativacao TEXT;

-- PASSO 4: Criar view apenas de receitas ativas
DROP VIEW IF EXISTS receitas_ativas;

CREATE OR REPLACE VIEW receitas_ativas AS
SELECT * FROM receitas
WHERE ativo = TRUE
ORDER BY nome;

COMMENT ON VIEW receitas_ativas IS 'Lista apenas receitas ativas (não desativadas)';

-- PASSO 5: Criar view de receitas desativadas
DROP VIEW IF EXISTS receitas_desativadas;

CREATE OR REPLACE VIEW receitas_desativadas AS
SELECT 
  r.*,
  (SELECT COUNT(*) FROM itens_venda iv WHERE iv.receita_id = r.id) as total_vendas,
  (SELECT SUM(iv.quantidade) FROM itens_venda iv WHERE iv.receita_id = r.id) as quantidade_vendida,
  (SELECT SUM(iv.valor_unitario * iv.quantidade) FROM itens_venda iv WHERE iv.receita_id = r.id) as total_faturado
FROM receitas r
WHERE ativo = FALSE
ORDER BY data_desativacao DESC;

COMMENT ON VIEW receitas_desativadas IS 'Lista receitas desativadas com estatísticas de vendas';

-- PASSO 6: Criar função para desativar receita
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
  -- Buscar informações da receita
  SELECT nome INTO receita_nome
  FROM receitas
  WHERE id = receita_id_param;
  
  IF NOT FOUND THEN
    sucesso := FALSE;
    mensagem := 'Receita não encontrada';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Contar vendas
  SELECT 
    COUNT(*),
    COALESCE(SUM(iv.quantidade), 0),
    COALESCE(SUM(iv.valor_unitario * iv.quantidade), 0)
  INTO vendas_count, qtd_vendida, faturamento
  FROM itens_venda iv
  WHERE iv.receita_id = receita_id_param;
  
  -- Desativar a receita
  UPDATE receitas
  SET 
    ativo = FALSE,
    data_desativacao = NOW(),
    motivo_desativacao = motivo_param
  WHERE id = receita_id_param;
  
  -- Retornar sucesso
  sucesso := TRUE;
  mensagem := 'Receita "' || receita_nome || '" desativada com sucesso';
  total_vendas := vendas_count;
  quantidade_vendida := qtd_vendida;
  total_faturado := faturamento;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION desativar_receita IS 'Desativa uma receita em vez de deletar, mantendo histórico';

-- PASSO 7: Criar função para reativar receita
CREATE OR REPLACE FUNCTION reativar_receita(receita_id_param UUID)
RETURNS TABLE(
  sucesso BOOLEAN,
  mensagem TEXT
) AS $$
DECLARE
  receita_nome TEXT;
BEGIN
  -- Buscar nome da receita
  SELECT nome INTO receita_nome
  FROM receitas
  WHERE id = receita_id_param;
  
  IF NOT FOUND THEN
    sucesso := FALSE;
    mensagem := 'Receita não encontrada';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Reativar
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

COMMENT ON FUNCTION reativar_receita IS 'Reativa uma receita que foi desativada';

-- PASSO 8: Notificar PostgREST
NOTIFY pgrst, 'reload schema';

-- PASSO 9: Verificação
SELECT 
  '✅ SOFT DELETE CONFIGURADO' as status;

-- Estatísticas
SELECT 
  '📊 ESTATÍSTICAS' as status,
  COUNT(*) as total_receitas,
  COUNT(*) FILTER (WHERE ativo = TRUE) as ativas,
  COUNT(*) FILTER (WHERE ativo = FALSE) as desativadas
FROM receitas;

-- Verificar colunas
SELECT 
  '✅ COLUNAS ADICIONADAS' as status,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'receitas'
AND column_name IN ('ativo', 'data_desativacao', 'motivo_desativacao')
ORDER BY column_name;

-- Verificar funções
SELECT 
  '✅ FUNÇÕES CRIADAS' as status,
  proname as funcao
FROM pg_proc
WHERE proname IN ('desativar_receita', 'reativar_receita');

-- Mensagem final
SELECT 
  '🎉 PRONTO!' as status,
  'Agora você pode desativar receitas sem perder histórico de vendas!' as mensagem;

