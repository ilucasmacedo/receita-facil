# 🚀 Guia de Configuração - Receita Fácil

## Passo 1: Configurar o Supabase

### 1.1 Criar conta e projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Aguarde alguns minutos enquanto o projeto é criado

### 1.2 Obter credenciais
1. No painel do Supabase, vá em **Project Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 1.3 Criar arquivo .env.local
Na raiz do projeto, crie um arquivo chamado `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**⚠️ IMPORTANTE:** Substitua pelos valores reais do seu projeto!

## Passo 2: Criar as Tabelas no Supabase

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole e execute o seguinte SQL:

```sql
-- Tabela de Ingredientes
CREATE TABLE ingredientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_total DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL, -- g, kg, ml, L, un
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Receitas
CREATE TABLE receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  rendimento_porcoes INT DEFAULT 1,
  margem_lucro_desejada DECIMAL(10,2) DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ligação (Ingredientes da Receita)
CREATE TABLE itens_receita (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID REFERENCES receitas ON DELETE CASCADE,
  ingrediente_id UUID REFERENCES ingredientes,
  quantidade_usada DECIMAL(10,2) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_receita ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança: usuários só veem seus próprios dados
CREATE POLICY "Users can view own ingredientes" ON ingredientes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredientes" ON ingredientes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredientes" ON ingredientes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own receitas" ON receitas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receitas" ON receitas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own receitas" ON receitas
  FOR DELETE USING (auth.uid() = user_id);
```

4. Clique em **Run** para executar

## Passo 3: Criar Conta de Teste

### Opção A: Usando o Script (Recomendado)

1. Instale a dependência dotenv (se ainda não instalou):
```bash
npm install
```

2. Execute o script:
```bash
npm run create-test-user
```

### Opção B: Manualmente no Painel do Supabase

1. No painel do Supabase, vá em **Authentication**
2. Clique em **Users**
3. Clique em **Add User** > **Create new user**
4. Preencha:
   - **Email:** teste@teste.com
   - **Password:** 123456
   - **Auto Confirm User:** ✅ (marque esta opção)
5. Clique em **Create User**

## Passo 4: Executar a Aplicação

```bash
npm run dev
```

Acesse: **http://localhost:3000**

## ✅ Teste Rápido

1. Na tela inicial, clique em **"Acesso Master (Teste)"**
2. Você será logado automaticamente
3. Navegue para **Ingredientes** e teste o cadastro!

---

## 🆘 Problemas Comuns

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Confirme que as variáveis estão corretas

### Erro ao criar conta de teste
- Verifique se o email já não existe
- No painel do Supabase, vá em Authentication > Users e confirme o usuário manualmente

### Erro ao acessar ingredientes
- Certifique-se de que as tabelas foram criadas
- Verifique se as políticas RLS estão ativas

