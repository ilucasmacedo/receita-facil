-- ======================================
-- ADICIONAR COLUNA 'TIPO' EM RECEITAS
-- ======================================
-- Execute este SQL no Editor SQL do Supabase

-- PASSO 1: Adicionar coluna tipo (nullable para não quebrar dados existentes)
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(255) DEFAULT NULL;

-- PASSO 2: Criar índice para melhorar performance de filtros
CREATE INDEX IF NOT EXISTS idx_receitas_tipo ON receitas(tipo);

-- PASSO 3: Notificar o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';

-- PASSO 4: Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'receitas' AND column_name = 'tipo';

-- PASSO 5 (Opcional): Inserir alguns valores exemplo para teste
-- Descomente as linhas abaixo se quiser adicionar tipos em receitas existentes

-- UPDATE receitas 
-- SET tipo = 'Bolo' 
-- WHERE nome ILIKE '%bolo%';

-- UPDATE receitas 
-- SET tipo = 'Doce' 
-- WHERE nome ILIKE '%doce%' OR nome ILIKE '%brigadeiro%';

-- UPDATE receitas 
-- SET tipo = 'Salgado' 
-- WHERE nome ILIKE '%salgado%' OR nome ILIKE '%coxinha%' OR nome ILIKE '%pastel%';

-- PASSO 6: Consultar tipos distintos existentes (útil para popular dropdown)
SELECT DISTINCT tipo, COUNT(*) as quantidade
FROM receitas
WHERE tipo IS NOT NULL
GROUP BY tipo
ORDER BY quantidade DESC;

-- ✅ PRONTO! A coluna 'tipo' foi adicionada com sucesso.

