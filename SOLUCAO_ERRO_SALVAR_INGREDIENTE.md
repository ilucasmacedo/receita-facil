# 🔧 Solução: Erro ao Salvar Ingrediente

## Possíveis Causas e Soluções

### 1. ❌ Tabela não criada no Supabase

**Sintoma:** Erro "relation 'ingredientes' does not exist"

**Solução:**
1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Execute o arquivo `SQL_SETUP_COMPLETO.sql` que acabei de criar
4. Ou cole e execute este SQL:

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
```

---

### 2. 🔒 Row Level Security (RLS) bloqueando

**Sintoma:** Erro "new row violates row-level security policy"

**Solução:**
Execute este SQL no Supabase:

```sql
-- Habilitar RLS
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;

-- Criar política de inserção
CREATE POLICY "Users can insert own ingredientes" 
  ON ingredientes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar política de visualização
CREATE POLICY "Users can view own ingredientes" 
  ON ingredientes FOR SELECT 
  USING (auth.uid() = user_id);

-- Criar política de exclusão
CREATE POLICY "Users can delete own ingredientes" 
  ON ingredientes FOR DELETE 
  USING (auth.uid() = user_id);
```

---

### 3. 👤 Usuário não autenticado

**Sintoma:** Erro "JWT expired" ou "Invalid JWT"

**Solução:**
1. Faça logout e login novamente
2. Use o botão "Acesso Master (Teste)"
3. Verifique se o usuário está confirmado no Supabase:
   - Vá em **Authentication > Users**
   - Verifique se o usuário está com status "Confirmed"

---

### 4. 🔑 Permissões da chave API

**Sintoma:** Erro "permission denied"

**Solução:**
1. Verifique se está usando a **anon key** (não a service_role key)
2. No arquivo `.env.local`, deve estar:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```

---

### 5. 📋 Formato de dados incorreto

**Sintoma:** Erro de validação ou tipo de dado

**Solução:**
- Verifique se está preenchendo todos os campos
- Preço deve ser um número (ex: 10.50)
- Quantidade deve ser um número positivo
- Unidade deve ser: g, kg, ml, L ou un

---

## 🚀 Solução Rápida (Execute Tudo de Uma Vez)

Execute este SQL completo no **SQL Editor** do Supabase:

```sql
-- Criar tabela
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
```

---

## 🔍 Como Ver o Erro Real

Agora o código mostra a mensagem de erro real. Quando tentar salvar:

1. Abra o **Console do Navegador** (F12)
2. Tente salvar um ingrediente
3. Veja a mensagem de erro exata no console
4. A mensagem também aparecerá no alert

---

## ✅ Checklist de Verificação

- [ ] Tabela `ingredientes` existe no Supabase
- [ ] RLS está habilitado na tabela
- [ ] Políticas RLS foram criadas
- [ ] Usuário está logado e confirmado
- [ ] Arquivo `.env.local` está configurado corretamente
- [ ] Servidor Next.js foi reiniciado após criar `.env.local`

---

## 📞 Próximos Passos

1. **Execute o SQL completo** acima no Supabase
2. **Reinicie o servidor** Next.js (Ctrl+C e depois `npm run dev`)
3. **Faça login** novamente usando "Acesso Master (Teste)"
4. **Tente salvar** um ingrediente novamente
5. **Veja a mensagem de erro** no console se ainda houver problema

Me avise qual erro específico aparece agora!

