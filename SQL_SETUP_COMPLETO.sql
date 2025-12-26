-- ============================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO DO SUPABASE
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- 1. Criar tabela de Ingredientes
CREATE TABLE IF NOT EXISTS ingredientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  preco_compra DECIMAL(10,2) NOT NULL,
  quantidade_total DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL CHECK (unidade IN ('g', 'kg', 'ml', 'L', 'un')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de Receitas
CREATE TABLE IF NOT EXISTS receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  rendimento_porcoes INT DEFAULT 1,
  margem_lucro_desejada DECIMAL(10,2) DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de Itens de Receita
CREATE TABLE IF NOT EXISTS itens_receita (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE NOT NULL,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE NOT NULL,
  quantidade_usada DECIMAL(10,2) NOT NULL
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_receita ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Users can view own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can insert own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can update own ingredientes" ON ingredientes;
DROP POLICY IF EXISTS "Users can delete own ingredientes" ON ingredientes;

DROP POLICY IF EXISTS "Users can view own receitas" ON receitas;
DROP POLICY IF EXISTS "Users can insert own receitas" ON receitas;
DROP POLICY IF EXISTS "Users can update own receitas" ON receitas;
DROP POLICY IF EXISTS "Users can delete own receitas" ON receitas;

DROP POLICY IF EXISTS "Users can view own itens_receita" ON itens_receita;
DROP POLICY IF EXISTS "Users can insert own itens_receita" ON itens_receita;
DROP POLICY IF EXISTS "Users can delete own itens_receita" ON itens_receita;

-- 6. Criar políticas para INGREDIENTES
CREATE POLICY "Users can view own ingredientes" 
  ON ingredientes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredientes" 
  ON ingredientes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ingredientes" 
  ON ingredientes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredientes" 
  ON ingredientes FOR DELETE 
  USING (auth.uid() = user_id);

-- 7. Criar políticas para RECEITAS
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

-- 8. Criar políticas para ITENS_RECEITA
-- Usuários podem ver itens de receitas que eles possuem
CREATE POLICY "Users can view own itens_receita" 
  ON itens_receita FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM receitas 
      WHERE receitas.id = itens_receita.receita_id 
      AND receitas.user_id = auth.uid()
    )
  );

-- Usuários podem inserir itens em receitas que eles possuem
CREATE POLICY "Users can insert own itens_receita" 
  ON itens_receita FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receitas 
      WHERE receitas.id = itens_receita.receita_id 
      AND receitas.user_id = auth.uid()
    )
  );

-- Usuários podem deletar itens de receitas que eles possuem
CREATE POLICY "Users can delete own itens_receita" 
  ON itens_receita FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM receitas 
      WHERE receitas.id = itens_receita.receita_id 
      AND receitas.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se está tudo OK:

-- Verificar se as tabelas foram criadas:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('ingredientes', 'receitas', 'itens_receita');

-- Verificar se RLS está habilitado:
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('ingredientes', 'receitas', 'itens_receita');

-- Verificar políticas criadas:
-- SELECT * FROM pg_policies WHERE tablename IN ('ingredientes', 'receitas', 'itens_receita');

