# 🚨 SOLUÇÃO COMPLETA - Aplicação Não Funciona

## ❌ Problema
A aplicação não consegue adicionar ingredientes ou receitas.

## ✅ Solução Passo a Passo

### PASSO 1: Criar a Tabela no Supabase

1. **Acesse o Supabase:**
   - https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor:**
   - Menu lateral → **SQL Editor**
   - Clique em **New Query**

3. **Cole e Execute este SQL COMPLETO:**

```sql
-- Criar tabela ingredientes
CREATE TABLE IF NOT EXISTS ingredientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_total DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can insert own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can delete own ingredientes" ON ingredientes;

-- Criar políticas
CREATE POLICY "Users can view own ingredientes" 
  ON ingredientes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredientes" 
  ON ingredientes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredientes" 
  ON ingredientes FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar tabela receitas
CREATE TABLE IF NOT EXISTS receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  rendimento_porcoes INT DEFAULT 1,
  margem_lucro_desejada DECIMAL(10,2) DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para receitas
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;

-- Políticas para receitas
CREATE POLICY "Users can view own receitas" 
  ON receitas FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receitas" 
  ON receitas FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own receitas" 
  ON receitas FOR DELETE 
  USING (auth.uid() = user_id);
```

4. **Clique em RUN** (ou Ctrl+Enter)
5. **Aguarde a mensagem "Success"**

---

### PASSO 2: Verificar se Funcionou

1. **Na aplicação, acesse:** http://localhost:3000/diagnostico
2. **A página de diagnóstico vai mostrar:**
   - ✅ Se você está autenticado
   - ✅ Se as variáveis de ambiente estão OK
   - ✅ Se a tabela existe
   - ✅ Se as permissões estão configuradas

3. **Se tudo estiver verde**, volte para a página de Ingredientes e tente salvar!

---

### PASSO 3: Testar

1. Vá em **Ingredientes** na aplicação
2. Preencha o formulário:
   - Nome: Trigo
   - Preço: 2.40
   - Quantidade: 1000
   - Unidade: Gramas (g)
3. Clique em **Adicionar Ingrediente**
4. **Deve funcionar!** 🎉

---

## 🔍 Se Ainda Não Funcionar

### Verifique:

1. **Usuário está logado?**
   - Use o botão "Acesso Master (Teste)"
   - Ou faça login manualmente

2. **Tabela foi criada?**
   - Vá em **Table Editor** no Supabase
   - Você deve ver `ingredientes` e `receitas` na lista

3. **Políticas RLS estão ativas?**
   - Vá em **Authentication > Policies** no Supabase
   - Você deve ver as políticas para `ingredientes`

4. **Console do navegador (F12)**
   - Veja se há erros no console
   - Me envie a mensagem de erro exata

---

## 📋 Checklist Final

- [ ] SQL foi executado no Supabase
- [ ] Mensagem "Success" apareceu
- [ ] Tabela `ingredientes` aparece no Table Editor
- [ ] Usuário está logado na aplicação
- [ ] Página de diagnóstico mostra tudo OK
- [ ] Tentou salvar um ingrediente e funcionou

---

## 🆘 Precisa de Ajuda?

Me diga:
1. Qual erro aparece quando tenta salvar?
2. O que a página de diagnóstico mostra?
3. A tabela aparece no Table Editor do Supabase?

