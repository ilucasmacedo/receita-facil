# 🔧 CORREÇÃO DO TRIGGER DE ATUALIZAÇÃO AUTOMÁTICA

## ❌ Problema Identificado

O trigger `trigger_ingrediente_alterado` NÃO está funcionando. Quando você edita um ingrediente, as receitas que o utilizam não são marcadas para atualização.

## ✅ Solução Passo a Passo

### 1️⃣ Execute o SQL no Supabase

1. Abra o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole TODO o conteúdo do arquivo `SQL_FIX_TRIGGER_COMPLETO.sql`
4. Clique em **RUN**

### 2️⃣ Aguarde 30 segundos

Isso é importante para o Supabase processar as mudanças.

### 3️⃣ Reinicie o Servidor Local

No terminal do projeto:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### 4️⃣ Teste Novamente

1. Vá para `/receitas/teste-trigger`
2. Clique em "Executar Teste Completo"
3. Você deve ver:
   - ✅ Preço alterado no banco de dados
   - ✅ Trigger disparou
   - ✅ Receitas foram marcadas
   - ✅ **TRIGGER FUNCIONOU!**

### 5️⃣ Teste na Prática

1. Vá para `/ingredientes`
2. Edite um ingrediente qualquer (mude o preço)
3. Salve
4. Vá para `/receitas`
5. **Você deve ver um badge "🔄 Atualização Necessária"** na receita que usa esse ingrediente

---

## 🔍 O Que Foi Corrigido?

### Antes (Não Funcionava):
- Trigger tinha uma condição `WHEN` muito restritiva
- A condição `OLD.preco_compra IS DISTINCT FROM NEW.preco_compra` pode não funcionar com tipos DECIMAL
- Função pode não estar criada corretamente

### Depois (Funciona):
- ✅ Trigger **sem condição WHEN** (mais simples e confiável)
- ✅ Função com **logs para debug** (você pode ver no Supabase)
- ✅ Atualiza tanto `requer_atualizacao` quanto `ultima_atualizacao_custos`
- ✅ Marca todas as receitas existentes para garantir consistência

---

## 🐛 Se Ainda Não Funcionar

### Verificação 1: O Trigger Existe?

Execute este SQL no Supabase:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_ingrediente_alterado';
```

**Resultado esperado:** Uma linha mostrando o trigger com `tgenabled = 'O'`

### Verificação 2: A Função Existe?

```sql
SELECT * FROM pg_proc WHERE proname = 'marcar_receitas_para_atualizacao';
```

**Resultado esperado:** Uma linha mostrando a função

### Verificação 3: As Colunas Existem?

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'receitas' 
AND column_name IN ('requer_atualizacao', 'ultima_atualizacao_custos');
```

**Resultado esperado:** Duas linhas mostrando as colunas

---

## 📝 Logs de Debug

Para ver os logs do trigger funcionando:

1. No Supabase, vá em **Logs**
2. Filtre por "Database"
3. Edite um ingrediente
4. Você deve ver mensagens como:
   - `Trigger disparado para ingrediente: <uuid>`
   - `Receitas marcadas para atualização: 1`

---

## 💡 Por Que Isso Aconteceu?

O trigger pode não ter sido criado corretamente nas tentativas anteriores por:

1. **Schema cache**: Supabase não atualizou o schema
2. **Condição WHEN muito restritiva**: Não disparava em todas as situações
3. **Função não criada**: A função pode ter dado erro e passado despercebida
4. **Tipo de dados**: DECIMAL vs NUMERIC pode causar problemas na comparação

A solução agora é **mais simples e robusta**, sem condições complexas.

