# 📝 Como Criar a Conta de Teste Manualmente no Supabase

## Método 1: Criar via Painel do Supabase (Recomendado)

### Passo 1: Acessar o Painel
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **zqcjwaudqidtvtmbczim**

### Passo 2: Criar o Usuário
1. No menu lateral esquerdo, clique em **Authentication**
2. Clique na aba **Users**
3. Clique no botão **Add User** (canto superior direito)
4. Selecione **Create new user**

### Passo 3: Preencher os Dados
Preencha o formulário com:
- **Email:** `teste@teste.com`
- **Password:** `123456`
- **Auto Confirm User:** ✅ **MARQUE ESTA OPÇÃO** (importante!)
- **Send invitation email:** ❌ Desmarque (não necessário)

### Passo 4: Criar
1. Clique em **Create User**
2. Pronto! A conta está criada e confirmada

---

## Método 2: Criar via SQL (Alternativo)

Se preferir usar SQL:

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole este código:

```sql
-- Criar usuário de teste
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'teste@teste.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  '',
  ''
);
```

4. Clique em **Run**

**⚠️ Nota:** Este método pode não funcionar dependendo das configurações do Supabase. O Método 1 é mais confiável.

---

## ✅ Verificar se Funcionou

1. Volte para **Authentication > Users**
2. Você deve ver o usuário `teste@teste.com` na lista
3. O status deve estar como **Confirmed** (verificado)

---

## 🚀 Testar na Aplicação

1. Acesse: http://localhost:3000
2. Clique no botão **"Acesso Master (Teste)"**
3. Você deve ser logado automaticamente!

---

## 🆘 Problemas Comuns

### "Invalid login credentials"
- Verifique se a senha está correta: `123456`
- Verifique se o email está correto: `teste@teste.com`
- Certifique-se de que marcou "Auto Confirm User" ao criar

### "User already exists"
- A conta já existe! Tente fazer login diretamente
- Ou delete o usuário existente e crie novamente

### Usuário criado mas não consegue fazer login
- Vá em **Authentication > Users**
- Encontre o usuário `teste@teste.com`
- Clique nos três pontos (...) > **Confirm User**

