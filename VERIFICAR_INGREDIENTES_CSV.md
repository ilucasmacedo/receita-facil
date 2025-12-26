# 🔍 Verificar Ingredientes Importados via CSV

## ⚠️ Problema Comum

Quando você importa via CSV no Supabase, os ingredientes podem não ter o `user_id` correto, então eles não aparecem na sua aplicação (que filtra por `user_id`).

## ✅ Solução: Verificar e Corrigir

### Passo 1: Verificar no Supabase

1. Acesse o **Table Editor** no Supabase
2. Selecione a tabela `ingredientes`
3. Verifique se a coluna `user_id` está preenchida
4. Se estiver vazia ou com ID diferente, precisa corrigir

### Passo 2: Corrigir o user_id

Execute este SQL no **SQL Editor** do Supabase:

```sql
-- Substitua pelo seu User ID (veja na página de diagnóstico)
-- Seu ID: 3281f4db-9e06-4ad4-9f34-2f1c2913eebe

-- Atualizar todos os ingredientes sem user_id ou com user_id errado
UPDATE ingredientes 
SET user_id = '3281f4db-9e06-4ad4-9f34-2f1c2913eebe'
WHERE user_id IS NULL 
   OR user_id != '3281f4db-9e06-4ad4-9f34-2f1c2913eebe';
```

### Passo 3: Recarregar na Aplicação

1. Vá para a página de **Ingredientes**
2. Clique no botão **"Recarregar"** (canto superior direito da tabela)
3. Ou recarregue a página (F5)

---

## 🔍 Debug: Verificar no Console

1. Abra o **Console do Navegador** (F12)
2. Vá para a aba **Console**
3. Acesse a página de Ingredientes
4. Você verá logs como:
   - `Ingredientes carregados: X itens`
   - `User ID: seu-id-aqui`
   - `Dados: [...]`

Se aparecer `0 itens`, significa que não há ingredientes com seu `user_id`.

---

## ✅ Solução Rápida Completa

Execute este SQL para garantir que todos os ingredientes tenham seu user_id:

```sql
-- Deletar ingredientes sem user_id (se houver)
DELETE FROM ingredientes WHERE user_id IS NULL;

-- Inserir ingredientes de exemplo com seu user_id correto
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
```

---

## 🎯 Depois de Corrigir

1. Recarregue a página de Ingredientes
2. Clique no botão **"Recarregar"**
3. Você deve ver todos os ingredientes!

