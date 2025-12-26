-- ================================================
-- DELETAR TUDO - ULTRA AGRESSIVO
-- ================================================
-- Este SQL FORÇA a limpeza total, mesmo com dependências
-- Execute NO SUPABASE SQL EDITOR

-- ================================================
-- PASSO 1: DESABILITAR TODOS OS TRIGGERS
-- ================================================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE 'ALTER TABLE IF EXISTS ' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL';
    END LOOP;
END $$;

-- ================================================
-- PASSO 2: REMOVER TODAS AS VIEWS
-- ================================================
DROP VIEW IF EXISTS receitas_desativadas CASCADE;
DROP VIEW IF EXISTS alertas_estoque_insumos CASCADE;
DROP VIEW IF EXISTS alertas_estoque_produtos CASCADE;

-- ================================================
-- PASSO 3: REMOVER TODAS AS FUNÇÕES
-- ================================================
DROP FUNCTION IF EXISTS marcar_receitas_para_atualizacao() CASCADE;
DROP FUNCTION IF EXISTS recalcular_custo_receita(UUID) CASCADE;
DROP FUNCTION IF EXISTS deduzir_estoque_venda_produtos() CASCADE;
DROP FUNCTION IF EXISTS registrar_producao(UUID, INT) CASCADE;

-- ================================================
-- PASSO 4: DELETAR TODOS OS DADOS (COM CASCADE)
-- ================================================
TRUNCATE TABLE itens_venda CASCADE;
TRUNCATE TABLE vendas CASCADE;
TRUNCATE TABLE producoes CASCADE;
TRUNCATE TABLE historico_estoque CASCADE;
TRUNCATE TABLE itens_receita CASCADE;
TRUNCATE TABLE historico_compras CASCADE;
TRUNCATE TABLE receitas CASCADE;
TRUNCATE TABLE ingredientes CASCADE;

-- ================================================
-- PASSO 5: DROPAR TODAS AS TABELAS
-- ================================================
DROP TABLE IF EXISTS itens_venda CASCADE;
DROP TABLE IF EXISTS vendas CASCADE;
DROP TABLE IF EXISTS producoes CASCADE;
DROP TABLE IF EXISTS historico_estoque CASCADE;
DROP TABLE IF EXISTS itens_receita CASCADE;
DROP TABLE IF EXISTS historico_compras CASCADE;
DROP TABLE IF EXISTS receitas CASCADE;
DROP TABLE IF EXISTS ingredientes CASCADE;

-- ================================================
-- PASSO 6: VERIFICAR SE LIMPOU
-- ================================================
SELECT 
    'Tabelas restantes' AS status,
    COUNT(*) AS quantidade
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Se o resultado for 0, está limpo! ✅

-- ================================================
-- PASSO 7: AGORA EXECUTE O SQL DE CRIAÇÃO
-- ================================================
-- Após executar este SQL, execute: SQL_CRIAR_ESTRUTURA.sql

