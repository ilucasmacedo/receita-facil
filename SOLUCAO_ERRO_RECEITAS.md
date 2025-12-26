# 🔧 Solução: Erro ao Cadastrar Receitas

## ❌ Problema:
A página de receitas não está cadastrando e está dando erro.

---

## 🔍 Causas Mais Comuns:

### **1. SQL não foi executado (MAIS PROVÁVEL)**
Os campos novos (`foto_url`, `descricao`, `custo_total`, etc) não existem na tabela `receitas`.

**Erro típico:**
```
column "foto_url" does not exist
column "custo_total" does not exist
```

### **2. Tabela não existe**
A tabela `receitas` ou `itens_receita` não foi criada.

**Erro típico:**
```
relation "receitas" does not exist
```

### **3. Sem ingredientes cadastrados**
Não há ingredientes para adicionar à receita.

---

## ✅ SOLUÇÃO PASSO A PASSO:

### **Passo 1: Executar Diagnóstico**

1. Acesse: `http://localhost:3000/receitas/diagnostico`
2. Clique em **"Executar Diagnóstico"**
3. Veja quais testes falharam
4. Siga as instruções abaixo conforme o erro

---

### **Passo 2: Executar SQL (SE DER ERRO DE CAMPOS)**

Se o diagnóstico mostrar:
```
❌ Campos da tabela (foto_url, descricao, etc)
   column "foto_url" does not exist
```

**Solução:**

1. **Abra o Supabase:** https://supabase.com
2. **Vá em:** SQL Editor
3. **Abra o arquivo:** `SQL_ATUALIZAR_RECEITAS_COM_FOTO.sql` (na raiz do projeto)
4. **Copie TODO o conteúdo:**
   ```sql
   ALTER TABLE receitas 
   ADD COLUMN IF NOT EXISTS foto_url TEXT,
   ADD COLUMN IF NOT EXISTS descricao TEXT,
   ADD COLUMN IF NOT EXISTS tempo_preparo_minutos INT DEFAULT 0,
   ADD COLUMN IF NOT EXISTS custo_total DECIMAL(10,2) DEFAULT 0,
   ADD COLUMN IF NOT EXISTS preco_venda DECIMAL(10,2) DEFAULT 0;
   
   CREATE INDEX IF NOT EXISTS idx_receitas_user 
     ON receitas(user_id, created_at DESC);
   
   NOTIFY pgrst, 'reload schema';
   ```

5. **Cole no SQL Editor do Supabase**
6. **Clique em RUN** (botão verde)
7. **Aguarde 30 segundos** (importante!)
8. **Reinicie o servidor:**
   ```bash
   # No terminal, pressione Ctrl+C
   # E rode novamente:
   npm run dev
   ```

9. **Execute o diagnóstico novamente**

---

### **Passo 3: Criar Tabelas (SE NÃO EXISTIREM)**

Se o diagnóstico mostrar:
```
❌ Tabela "receitas" existe
   relation "receitas" does not exist
```

**Solução:**

1. **Vá no Supabase:** SQL Editor
2. **Execute este SQL:**
   ```sql
   -- Criar tabela de receitas
   CREATE TABLE IF NOT EXISTS receitas (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     nome TEXT NOT NULL,
     foto_url TEXT,
     descricao TEXT,
     rendimento_porcoes INT DEFAULT 1,
     tempo_preparo_minutos INT DEFAULT 0,
     margem_lucro_desejada DECIMAL(10,2) DEFAULT 100,
     custo_total DECIMAL(10,2) DEFAULT 0,
     preco_venda DECIMAL(10,2) DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Habilitar RLS
   ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;

   -- Políticas RLS
   CREATE POLICY "Users can view own receitas" 
     ON receitas FOR SELECT 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own receitas" 
     ON receitas FOR INSERT 
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own receitas" 
     ON receitas FOR UPDATE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own receitas" 
     ON receitas FOR DELETE 
     USING (auth.uid() = user_id);

   -- Criar tabela de itens da receita
   CREATE TABLE IF NOT EXISTS itens_receita (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE NOT NULL,
     ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE NOT NULL,
     quantidade_usada DECIMAL(10,2) NOT NULL
   );

   -- Habilitar RLS
   ALTER TABLE itens_receita ENABLE ROW LEVEL SECURITY;

   -- Políticas RLS para itens_receita
   CREATE POLICY "Users can view own itens_receita" 
     ON itens_receita FOR SELECT 
     USING (EXISTS (
       SELECT 1 FROM receitas 
       WHERE receitas.id = itens_receita.receita_id 
       AND receitas.user_id = auth.uid()
     ));

   CREATE POLICY "Users can insert own itens_receita" 
     ON itens_receita FOR INSERT 
     WITH CHECK (EXISTS (
       SELECT 1 FROM receitas 
       WHERE receitas.id = itens_receita.receita_id 
       AND receitas.user_id = auth.uid()
     ));

   CREATE POLICY "Users can delete own itens_receita" 
     ON itens_receita FOR DELETE 
     USING (EXISTS (
       SELECT 1 FROM receitas 
       WHERE receitas.id = itens_receita.receita_id 
       AND receitas.user_id = auth.uid()
     ));

   -- Notificar reload
   NOTIFY pgrst, 'reload schema';
   ```

3. **Aguarde 30 segundos**
4. **Reinicie o servidor**

---

### **Passo 4: Cadastrar Ingredientes (SE NECESSÁRIO)**

Se o diagnóstico mostrar:
```
⚠️ Ingredientes cadastrados
   0 ingrediente(s) encontrado(s)
```

**Solução:**

1. Vá na página **Ingredientes**
2. Cadastre alguns ingredientes antes de criar receitas
3. Ou importe o CSV de exemplo

---

## 🧪 Como Testar:

### **Teste 1: Diagnóstico**
```bash
# Acesse:
http://localhost:3000/receitas/diagnostico

# Clique em "Executar Diagnóstico"
# Veja se todos os testes passam ✅
```

### **Teste 2: Criar Receita Simples**
1. Vá em **Receitas**
2. Preencha:
   - Nome: "Teste"
   - Rendimento: 1
3. Adicione 1 ingrediente
4. Clique em "Salvar Receita"
5. Deve funcionar sem erros

---

## 🔍 Depuração (Console do Navegador):

### **Ver erro completo:**

1. Abra o Console (F12)
2. Tente criar uma receita
3. Veja o erro que aparece
4. Envie para mim se precisar de ajuda

**Erros comuns:**

```javascript
// Erro 1: Coluna não existe
{
  code: "42703",
  message: "column 'foto_url' does not exist"
}
→ Execute SQL_ATUALIZAR_RECEITAS_COM_FOTO.sql

// Erro 2: Tabela não existe
{
  code: "42P01",
  message: "relation 'receitas' does not exist"
}
→ Execute SQL de criação de tabelas

// Erro 3: RLS bloqueando
{
  code: "42501",
  message: "new row violates row-level security policy"
}
→ Verifique se está logado
```

---

## 📋 Checklist de Verificação:

- [ ] Executou o diagnóstico
- [ ] Executou o SQL no Supabase
- [ ] Aguardou 30 segundos
- [ ] Reiniciou o servidor (npm run dev)
- [ ] Está logado no sistema
- [ ] Tem ingredientes cadastrados
- [ ] Testou criar receita simples
- [ ] Verificou console (F12) se ainda houver erro

---

## 🎯 Se AINDA não funcionar:

### **Envie estas informações:**

1. **Erro do Console (F12):**
   ```
   [Cole aqui o erro que aparece]
   ```

2. **Resultado do Diagnóstico:**
   ```
   [Cole aqui quais testes falharam]
   ```

3. **Versão do Supabase:**
   - Vá no Supabase > Settings > General
   - Anote a versão

4. **Screenshot do erro** (se possível)

---

## ✅ Solução Rápida (TL;DR):

```bash
1. Acesse: http://localhost:3000/receitas/diagnostico
2. Execute diagnóstico
3. Se falhar: Vá no Supabase > SQL Editor
4. Execute: SQL_ATUALIZAR_RECEITAS_COM_FOTO.sql
5. Aguarde 30 segundos
6. Reinicie: npm run dev
7. Teste criar receita novamente
```

---

**Com estes passos você deve conseguir resolver! 🎉**

Se ainda houver erro, me envie o erro do console (F12).

