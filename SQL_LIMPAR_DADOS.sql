-- ================================================
-- LIMPAR TODOS OS DADOS (Mantém Estrutura)
-- ================================================
-- Use este SQL para apagar todos os dados mas manter tabelas/políticas
-- ATENÇÃO: Esta ação NÃO pode ser desfeita!

-- PASSO 1: Desabilitar triggers temporariamente (evita erros)
ALTER TABLE ingredientes DISABLE TRIGGER ALL;
ALTER TABLE receitas DISABLE TRIGGER ALL;
ALTER TABLE itens_receita DISABLE TRIGGER ALL;
ALTER TABLE vendas DISABLE TRIGGER ALL;
ALTER TABLE itens_venda DISABLE TRIGGER ALL;

-- PASSO 2: Deletar dados (ordem importa por causa das foreign keys)
DELETE FROM itens_venda;
DELETE FROM vendas;
DELETE FROM producoes;
DELETE FROM historico_estoque;
DELETE FROM itens_receita;
DELETE FROM historico_compras;
DELETE FROM receitas;
DELETE FROM ingredientes;

-- PASSO 3: Reabilitar triggers
ALTER TABLE ingredientes ENABLE TRIGGER ALL;
ALTER TABLE receitas ENABLE TRIGGER ALL;
ALTER TABLE itens_receita ENABLE TRIGGER ALL;
ALTER TABLE vendas ENABLE TRIGGER ALL;
ALTER TABLE itens_venda ENABLE TRIGGER ALL;

-- PASSO 4: Resetar sequências (se houver)
-- (UUID não precisa, mas fica aqui caso tenha IDs incrementais no futuro)

-- PASSO 5: Limpar Storage (fotos) - MANUAL
-- Vá para Storage → receitas-fotos → Delete all files

-- ================================================
-- VERIFICAÇÃO
-- ================================================
SELECT 'ingredientes' AS tabela, COUNT(*) AS registros FROM ingredientes
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

-- ✅ Resultado esperado: Todas as contagens devem ser 0

-- ================================================
-- IMPORTANTE
-- ================================================
-- Este SQL:
-- ✅ Apaga TODOS os dados
-- ✅ Mantém as tabelas
-- ✅ Mantém as políticas RLS
-- ✅ Mantém as funções e triggers
-- ❌ NÃO apaga fotos do Storage (faça manual)

