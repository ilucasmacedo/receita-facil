-- ================================================
-- LIMPAR APENAS DADOS (Mantém Estrutura)
-- ================================================
-- Este SQL apaga todos os registros mas mantém:
-- ✅ Tabelas
-- ✅ Funções
-- ✅ Triggers
-- ✅ Views
-- ✅ Políticas RLS
-- ✅ Índices

-- ================================================
-- LIMPAR DADOS (ordem importa por foreign keys)
-- ================================================

-- 1. Tabelas dependentes primeiro
DELETE FROM itens_venda;
DELETE FROM vendas;
DELETE FROM producoes;
DELETE FROM historico_estoque;
DELETE FROM itens_receita;
DELETE FROM historico_compras;

-- 2. Tabelas principais
DELETE FROM receitas;
DELETE FROM ingredientes;

-- ================================================
-- RESETAR SEQUÊNCIAS (se houver auto-increment)
-- ================================================
-- Como usamos UUID, não precisa resetar sequências

-- ================================================
-- VERIFICAÇÃO
-- ================================================
SELECT 
    'ingredientes' AS tabela, 
    COUNT(*) AS registros 
FROM ingredientes
UNION ALL
SELECT 'receitas', COUNT(*) FROM receitas
UNION ALL
SELECT 'itens_receita', COUNT(*) FROM itens_receita
UNION ALL
SELECT 'historico_compras', COUNT(*) FROM historico_compras
UNION ALL
SELECT 'vendas', COUNT(*) FROM vendas
UNION ALL
SELECT 'itens_venda', COUNT(*) FROM itens_venda
UNION ALL
SELECT 'producoes', COUNT(*) FROM producoes
UNION ALL
SELECT 'historico_estoque', COUNT(*) FROM historico_estoque;

-- ✅ Resultado esperado: Todas as contagens = 0

-- ================================================
-- VERIFICAR ESTRUTURA (deve estar intacta)
-- ================================================
SELECT 
    'Tabelas existentes' AS tipo,
    COUNT(*) AS quantidade
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
UNION ALL
SELECT 'Funções existentes', COUNT(*)
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
UNION ALL
SELECT 'Triggers existentes', COUNT(*)
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- ✅ Resultado esperado:
-- Tabelas: 8
-- Funções: 4
-- Triggers: 2+

-- ================================================
-- PRONTO!
-- ================================================
-- ✅ Dados apagados
-- ✅ Estrutura mantida
-- ✅ Sistema pronto para novos cadastros
-- ✅ RLS ativo (cada usuário vê apenas seus dados)

