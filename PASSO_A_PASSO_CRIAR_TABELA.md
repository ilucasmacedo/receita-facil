# 📋 Passo a Passo: Criar Tabela de Ingredientes

## ✅ Método 1: SQL Editor (Mais Rápido - RECOMENDADO)

### Passo 1: Acessar o SQL Editor
1. No painel do Supabase, no menu lateral esquerdo
2. Clique no ícone **SQL Editor** (ou procure por "SQL Editor" no menu)
3. Clique no botão **New Query** (canto superior direito)

### Passo 2: Copiar o SQL
Copie TODO este código SQL:

```sql
CREATE TABLE ingredientes (
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

### Passo 3: Colar e Executar
1. Cole o SQL na área de texto do SQL Editor
2. Clique no botão **RUN** (ou pressione **Ctrl+Enter**)
3. Aguarde alguns segundos
4. Você deve ver a mensagem: **"Success. No rows returned"**

### Passo 4: Verificar
1. Vá em **Table Editor** (menu lateral)
2. Você deve ver a tabela **`ingredientes`** na lista!

---

## ✅ Método 2: Table Editor (Interface Gráfica)

Se preferir usar a interface visual:

### Passo 1: Criar Nova Tabela
1. No **Table Editor**, clique no botão **New table**
2. Preencha:
   - **Name:** `ingredientes`
   - **Description:** (opcional) "Tabela de ingredientes"

### Passo 2: Adicionar Colunas
Clique em **Add Column** para cada coluna:

1. **id**
   - Name: `id`
   - Type: `uuid`
   - Default value: `gen_random_uuid()`
   - ✅ Primary key
   - ✅ Is nullable: DESMARQUE

2. **user_id**
   - Name: `user_id`
   - Type: `uuid`
   - Foreign key: `auth.users(id)`
   - ✅ Is nullable: DESMARQUE

3. **nome**
   - Name: `nome`
   - Type: `text`
   - ✅ Is nullable: DESMARQUE

4. **preco_compra**
   - Name: `preco_compra`
   - Type: `numeric`
   - Precision: `10`
   - Scale: `2`
   - ✅ Is nullable: DESMARQUE

5. **quantidade_total**
   - Name: `quantidade_total`
   - Type: `numeric`
   - Precision: `10`
   - Scale: `2`
   - ✅ Is nullable: DESMARQUE

6. **unidade**
   - Name: `unidade`
   - Type: `text`
   - ✅ Is nullable: DESMARQUE

7. **created_at**
   - Name: `created_at`
   - Type: `timestamptz`
   - Default value: `now()`
   - ✅ Is nullable: MARQUE (pode ser null)

### Passo 3: Salvar
Clique em **Save** para criar a tabela

### Passo 4: Configurar RLS (IMPORTANTE!)
Após criar a tabela:

1. Vá em **Authentication** > **Policies** (ou procure por "Row Level Security")
2. Selecione a tabela `ingredientes`
3. Clique em **New Policy**
4. Crie 3 políticas:

**Política 1 - SELECT:**
- Policy name: `Users can view own ingredientes`
- Allowed operation: `SELECT`
- USING expression: `auth.uid() = user_id`

**Política 2 - INSERT:**
- Policy name: `Users can insert own ingredientes`
- Allowed operation: `INSERT`
- WITH CHECK expression: `auth.uid() = user_id`

**Política 3 - DELETE:**
- Policy name: `Users can delete own ingredientes`
- Allowed operation: `DELETE`
- USING expression: `auth.uid() = user_id`

---

## 🎯 Qual Método Usar?

**Recomendo o Método 1 (SQL Editor)** porque:
- ✅ Mais rápido (1 comando só)
- ✅ Cria tudo de uma vez (tabela + políticas)
- ✅ Menos chance de erro

---

## ✅ Depois de Criar

1. Volte para a aplicação
2. Recarregue a página (F5)
3. Tente salvar o ingrediente novamente
4. Deve funcionar! 🎉

