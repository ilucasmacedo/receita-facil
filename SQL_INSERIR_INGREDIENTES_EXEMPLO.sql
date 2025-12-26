-- ============================================
-- INSERIR INGREDIENTES DE EXEMPLO
-- Execute este SQL no Supabase SQL Editor
-- ============================================
-- IMPORTANTE: Substitua 'SEU_USER_ID' pelo seu ID de usuário
-- Você pode ver seu ID na página de diagnóstico

-- Substitua esta linha pelo seu User ID:
-- Seu ID: 3281f4db-9e06-4ad4-9f34-2f1c2913eebe

INSERT INTO ingredientes (user_id, nome, preco_compra, quantidade_total, unidade) VALUES
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Farinha de Trigo', 10.00, 2000, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Açúcar', 8.50, 1000, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Sal', 2.40, 500, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Óleo de Soja', 12.00, 900, 'ml'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Ovos', 15.00, 12, 'un'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Leite', 5.50, 1000, 'ml'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Manteiga', 18.00, 500, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Fermento em Pó', 4.50, 200, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Cacau em Pó', 25.00, 500, 'g'),
('3281f4db-9e06-4ad4-9f34-2f1c2913eebe', 'Baunilha', 12.00, 50, 'ml');

-- ============================================
-- PRONTO! 10 ingredientes de exemplo foram inseridos
-- ============================================

