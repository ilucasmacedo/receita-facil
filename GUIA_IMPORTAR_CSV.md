# 📊 Como Importar CSV no Supabase

## ⚠️ IMPORTANTE: Criar Tabela Primeiro!

O Supabase **não permite criar tabelas via CSV**. Você precisa:

1. **Primeiro:** Criar a tabela via SQL (veja abaixo)
2. **Depois:** Importar os dados do CSV

---

## Passo 1: Criar a Tabela (OBRIGATÓRIO)

### No SQL Editor do Supabase, execute:

```sql
CREATE TABLE IF NOT EXISTS ingredientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_total DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ingredientes" 
  ON ingredientes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredientes" 
  ON ingredientes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredientes" 
  ON ingredientes FOR DELETE 
  USING (auth.uid() = user_id);
```

---

## Passo 2: Importar CSV (Dados de Exemplo)

### Opção A: Via Table Editor (Mais Fácil)

1. **Acesse:** Table Editor no Supabase
2. **Selecione a tabela:** `ingredientes`
3. **Clique em:** "Insert row" (ou botão de +)
4. **Preencha manualmente** os dados do CSV

### Opção B: Via SQL (Importar Múltiplos)

1. **No SQL Editor**, execute este SQL (substitua `SEU_USER_ID` pelo seu ID):

```sql
-- Substitua 'SEU_USER_ID' pelo ID do seu usuário
-- Você pode ver seu ID na página de diagnóstico: http://localhost:3000/diagnostico

INSERT INTO ingredientes (user_id, nome, preco_compra, quantidade_total, unidade) VALUES
('SEU_USER_ID', 'Farinha de Trigo', 10.00, 2000, 'g'),
('SEU_USER_ID', 'Açúcar', 8.50, 1000, 'g'),
('SEU_USER_ID', 'Sal', 2.40, 500, 'g'),
('SEU_USER_ID', 'Óleo de Soja', 12.00, 900, 'ml'),
('SEU_USER_ID', 'Ovos', 15.00, 12, 'un'),
('SEU_USER_ID', 'Leite', 5.50, 1000, 'ml'),
('SEU_USER_ID', 'Manteiga', 18.00, 500, 'g'),
('SEU_USER_ID', 'Fermento em Pó', 4.50, 200, 'g'),
('SEU_USER_ID', 'Cacau em Pó', 25.00, 500, 'g'),
('SEU_USER_ID', 'Baunilha', 12.00, 50, 'ml');
```

2. **Substitua `SEU_USER_ID`** pelo seu ID real (veja na página de diagnóstico)

---

## Passo 3: Verificar

1. Vá em **Table Editor**
2. Selecione a tabela `ingredientes`
3. Você deve ver os ingredientes importados!

---

## 📝 Nota sobre CSV

O arquivo `ingredientes_exemplo.csv` foi criado com dados de exemplo, mas:
- O Supabase **não tem importação direta de CSV** na interface
- Você precisa usar SQL ou inserir manualmente
- O CSV serve como referência dos dados

---

## ✅ Alternativa Rápida

Se quiser adicionar dados rapidamente, use o SQL acima substituindo `SEU_USER_ID` pelo seu ID de usuário (que você viu na página de diagnóstico: `3281f4db-9e06-4ad4-9f34-2f1c2913eebe`).

