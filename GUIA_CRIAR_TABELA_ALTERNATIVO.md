# 🔧 Como Criar a Tabela - Métodos Alternativos

## Método 1: SQL Editor (Recomendado)

Mesmo com o erro no OAuth, o SQL Editor deve funcionar:

1. **Acesse:** https://supabase.com/dashboard/project/zqcjwaudqidtvtmbczim/sql/new
2. **Ou navegue manualmente:**
   - Dashboard do Supabase
   - Selecione seu projeto
   - Menu lateral: **SQL Editor**
   - Clique em **New Query**

3. **Cole este SQL:**

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

DROP POLICY IF EXISTS "Users can view own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can insert own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can delete own ingredientes" ON ingredientes;

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

4. **Clique em RUN** (ou Ctrl+Enter)

---

## Método 2: Table Editor (Interface Gráfica)

Se o SQL Editor não funcionar, use a interface gráfica:

1. **Acesse:** https://supabase.com/dashboard/project/zqcjwaudqidtvtmbczim/editor
2. **Ou navegue:**
   - Dashboard > Seu Projeto
   - Menu lateral: **Table Editor**
   - Clique em **New Table**

3. **Configure a tabela:**
   - **Name:** `ingredientes`
   - **Columns:**
     - `id` - UUID - Primary Key - Default: `gen_random_uuid()`
     - `user_id` - UUID - Foreign Key → `auth.users(id)`
     - `nome` - Text - Not Null
     - `preco_compra` - Numeric (10,2) - Not Null
     - `quantidade_total` - Numeric (10,2) - Not Null
     - `unidade` - Text - Not Null
     - `created_at` - Timestamp - Default: `now()`

4. **Após criar, vá em Authentication > Policies** e crie as políticas RLS

---

## Método 3: Via API (Script Node.js)

Se nada funcionar, posso criar um script que cria a tabela via API do Supabase.

---

## ⚠️ Sobre o Erro do OAuth

O erro que você viu é um bug do painel do Supabase. Ele não afeta:
- SQL Editor
- Table Editor
- Authentication
- Database

É apenas um problema na página de OAuth Apps. Você pode ignorá-lo.

---

## ✅ Verificar se Funcionou

Depois de criar a tabela, verifique:

1. Vá em **Table Editor**
2. Você deve ver a tabela `ingredientes` na lista
3. Ou execute no SQL Editor:
```sql
SELECT * FROM ingredientes LIMIT 1;
```

Se não der erro, a tabela existe!

