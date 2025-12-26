# 🔧 Solução: Trigger Não Está Funcionando

## ❌ Problema:
Alterou ingrediente mas receita não mostrou necessidade de atualização.

---

## 🔍 Causas Possíveis:

### **1. SQL não foi executado** (MAIS COMUM)
Os campos e triggers não existem no banco.

### **2. Trigger não foi criado corretamente**
O trigger existe mas não está ativo.

### **3. Receita criada antes do SQL**
Receita antiga não tem os campos novos.

---

## ✅ SOLUÇÃO:

### **Passo 1: Execute o Diagnóstico**
```
Acesse: http://localhost:3000/receitas/diagnostico-atualizacao
Clique: "Executar Diagnóstico"
Veja: Quais testes falharam
```

### **Passo 2: Execute o SQL Completo**

Abra Supabase e execute este SQL:

```sql
-- 1. Adicionar campos de controle
ALTER TABLE receitas 
ADD COLUMN IF NOT EXISTS ultima_atualizacao_custos TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS requer_atualizacao BOOLEAN DEFAULT FALSE;

-- 2. Criar função para marcar receitas
CREATE OR REPLACE FUNCTION marcar_receitas_para_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE receitas
  SET requer_atualizacao = TRUE
  WHERE id IN (
    SELECT DISTINCT receita_id 
    FROM itens_receita 
    WHERE ingrediente_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger
DROP TRIGGER IF EXISTS trigger_ingrediente_alterado ON ingredientes;
CREATE TRIGGER trigger_ingrediente_alterado
  AFTER UPDATE OF preco_compra, quantidade_total, tipo_origem
  ON ingredientes
  FOR EACH ROW
  WHEN (OLD.preco_compra IS DISTINCT FROM NEW.preco_compra 
    OR OLD.quantidade_total IS DISTINCT FROM NEW.quantidade_total
    OR OLD.tipo_origem IS DISTINCT FROM NEW.tipo_origem)
  EXECUTE FUNCTION marcar_receitas_para_atualizacao();

-- 4. Criar função de recálculo
CREATE OR REPLACE FUNCTION recalcular_custo_receita(receita_id_param UUID)
RETURNS TABLE(
  novo_custo_total DECIMAL(10,2),
  novo_preco_venda DECIMAL(10,2),
  itens_atualizados INT
) AS $$
DECLARE
  v_custo_total DECIMAL(10,2) := 0;
  v_preco_venda DECIMAL(10,2) := 0;
  v_margem DECIMAL(10,2);
  v_itens INT := 0;
BEGIN
  SELECT 
    COALESCE(SUM(
      (i.preco_compra / NULLIF(i.quantidade_total, 0)) * ir.quantidade_usada
    ), 0),
    COUNT(*)
  INTO v_custo_total, v_itens
  FROM itens_receita ir
  JOIN ingredientes i ON ir.ingrediente_id = i.id
  WHERE ir.receita_id = receita_id_param;

  SELECT margem_lucro_desejada 
  INTO v_margem
  FROM receitas 
  WHERE id = receita_id_param;

  v_preco_venda := v_custo_total * (1 + (v_margem / 100));

  UPDATE receitas
  SET 
    custo_total = v_custo_total,
    preco_venda = v_preco_venda,
    requer_atualizacao = FALSE,
    ultima_atualizacao_custos = NOW()
  WHERE id = receita_id_param;

  RETURN QUERY SELECT v_custo_total, v_preco_venda, v_itens;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar função para recalcular todas
CREATE OR REPLACE FUNCTION recalcular_todas_receitas_desatualizadas()
RETURNS TABLE(
  receita_id UUID,
  receita_nome TEXT,
  custo_anterior DECIMAL(10,2),
  custo_novo DECIMAL(10,2),
  diferenca DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH receitas_para_atualizar AS (
    SELECT 
      r.id,
      r.nome,
      r.custo_total as custo_old
    FROM receitas r
    WHERE r.requer_atualizacao = TRUE
  ),
  atualizacoes AS (
    SELECT 
      rpa.id,
      rpa.nome,
      rpa.custo_old,
      (recalcular_custo_receita(rpa.id)).novo_custo_total as custo_new
    FROM receitas_para_atualizar rpa
  )
  SELECT 
    a.id,
    a.nome,
    a.custo_old,
    a.custo_new,
    (a.custo_new - a.custo_old) as diferenca
  FROM atualizacoes a;
END;
$$ LANGUAGE plpgsql;

-- 6. Recarregar schema
NOTIFY pgrst, 'reload schema';
```

**Aguarde 30 segundos e reinicie: `npm run dev`**

---

### **Passo 3: Verificar se Funcionou**

Execute este SQL para ver se o trigger existe:

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_ingrediente_alterado';
```

**Deve retornar 1 linha com o trigger.**

---

### **Passo 4: Teste Manual**

Se ainda não funcionar, teste manualmente:

```sql
-- Ver receitas atuais
SELECT id, nome, requer_atualizacao FROM receitas;

-- Marcar uma receita manualmente
UPDATE receitas
SET requer_atualizacao = TRUE
WHERE nome = 'Bolo de Chocolate';

-- Verificar
SELECT id, nome, requer_atualizacao FROM receitas;
```

---

## 🧪 Teste Completo:

### **1. Preparação:**
```
✅ Execute SQL completo
✅ Aguarde 30 segundos
✅ Reinicie servidor
✅ Tenha uma receita com ingredientes
```

### **2. Teste:**
```
1. Vá em Ingredientes
2. Edite "Farinha" (ou qualquer ingrediente)
3. Altere preço: R$ 10,00 → R$ 12,00
4. Salve
5. Vá em Receitas
6. Deve aparecer badge [⚠️ Atualizar]
```

### **3. Se NÃO aparecer:**
```
1. Execute: http://localhost:3000/receitas/diagnostico-atualizacao
2. Veja qual teste falhou
3. Siga as instruções
```

---

## 🔍 Verificação no Banco:

### **Ver se campos existem:**
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'receitas'
AND column_name IN ('requer_atualizacao', 'ultima_atualizacao_custos');
```

**Deve retornar 2 linhas.**

### **Ver se trigger existe:**
```sql
SELECT trigger_name 
FROM information_schema.triggers
WHERE trigger_name = 'trigger_ingrediente_alterado';
```

**Deve retornar 1 linha.**

### **Ver se função existe:**
```sql
SELECT routine_name 
FROM information_schema.routines
WHERE routine_name IN ('marcar_receitas_para_atualizacao', 'recalcular_custo_receita');
```

**Deve retornar 2 linhas.**

---

## 🚨 Solução Alternativa (se trigger não funcionar):

Se o trigger não funcionar mesmo depois de executar o SQL, use atualização manual:

### **Opção 1: Botão "Atualizar Todas"**
Na página de receitas, sempre clique em "Atualizar Todas" após alterar ingredientes.

### **Opção 2: SQL Manual**
```sql
-- Marcar TODAS as receitas como desatualizadas
UPDATE receitas
SET requer_atualizacao = TRUE;
```

Depois vá na página e clique em "Atualizar Todas".

---

## 📋 Checklist de Resolução:

- [ ] Executou SQL completo
- [ ] Aguardou 30 segundos
- [ ] Reiniciou servidor
- [ ] Executou diagnóstico
- [ ] Todos os testes passaram
- [ ] Campos existem no banco
- [ ] Trigger existe no banco
- [ ] Funções existem no banco
- [ ] Testou alterar ingrediente
- [ ] Badge apareceu

---

## 💡 Dica de Debug:

Se ainda não funcionar, abra o Console do navegador (F12) e veja se há erros ao:
1. Alterar ingrediente
2. Carregar receitas
3. Clicar em "Recalcular"

---

**Execute o diagnóstico primeiro e me envie o resultado! 🔍**

