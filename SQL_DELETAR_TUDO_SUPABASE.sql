-- ================================================
-- DELETAR TUDO - COMPATÍVEL COM SUPABASE
-- ================================================
-- Este SQL funciona no Supabase sem erro de permissão

-- ================================================
-- PASSO 1: REMOVER TODAS AS VIEWS
-- ================================================
DROP VIEW IF EXISTS receitas_desativadas CASCADE;
DROP VIEW IF EXISTS alertas_estoque_insumos CASCADE;
DROP VIEW IF EXISTS alertas_estoque_produtos CASCADE;

-- ================================================
-- PASSO 2: REMOVER TODOS OS TRIGGERS
-- ================================================
DROP TRIGGER IF EXISTS trigger_ingrediente_alterado ON ingredientes;
DROP TRIGGER IF EXISTS trigger_deduzir_estoque_venda ON vendas;
DROP TRIGGER IF EXISTS trigger_atualizar_receita_producao ON producoes;

-- ================================================
-- PASSO 3: REMOVER TODAS AS FUNÇÕES
-- ================================================
DROP FUNCTION IF EXISTS marcar_receitas_para_atualizacao() CASCADE;
DROP FUNCTION IF EXISTS recalcular_custo_receita(UUID) CASCADE;
DROP FUNCTION IF EXISTS deduzir_estoque_venda_produtos() CASCADE;
DROP FUNCTION IF EXISTS registrar_producao(UUID, INT) CASCADE;

-- ================================================
-- PASSO 4: DROPAR TODAS AS TABELAS (COM CASCADE)
-- ================================================
-- Ordem inversa por causa das foreign keys
DROP TABLE IF EXISTS itens_venda CASCADE;
DROP TABLE IF EXISTS vendas CASCADE;
DROP TABLE IF EXISTS producoes CASCADE;
DROP TABLE IF EXISTS historico_estoque CASCADE;
DROP TABLE IF EXISTS itens_receita CASCADE;
DROP TABLE IF EXISTS historico_compras CASCADE;
DROP TABLE IF EXISTS receitas CASCADE;
DROP TABLE IF EXISTS ingredientes CASCADE;

-- ================================================
-- PASSO 5: VERIFICAR SE LIMPOU
-- ================================================
SELECT 
    'Tabelas restantes no banco' AS status,
    COUNT(*) AS quantidade
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE 'sql_%';

-- ✅ Se o resultado for 0, está completamente limpo!

-- ================================================
-- PRÓXIMO PASSO
-- ================================================
-- Agora execute: SQL_CRIAR_ESTRUTURA.sql

