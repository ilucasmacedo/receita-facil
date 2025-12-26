# 🚨 SOLUÇÃO: Erro ao Deletar Receita

## ❌ **Seu Erro:**

```
Erro ao deletar: update or delete on table "receitas" 
violates foreign key constraint "itens_venda_receita_id_fkey"
```

---

## 🔍 **Por Que Acontece:**

```
Receita: "Bolo de Trigo"
   ↓
Foi vendida 15 vezes
   ↓
Tem registros na tabela de vendas
   ↓
❌ NÃO PODE DELETAR (perderia histórico!)
```

---

## ✅ **SOLUÇÃO: SOFT DELETE**

Em vez de **deletar**, você **desativa**:

```
DELETAR (RUIM):
❌ Apaga para sempre
❌ Perde histórico de vendas
❌ Relatórios quebrados

DESATIVAR (BOM):
✅ Marca como "inativa"
✅ Mantém histórico
✅ Pode reativar depois
✅ Relatórios corretos
```

---

## 🚀 **COMO RESOLVER (1 minuto):**

### **Passo 1: Abrir Supabase**
```
🌐 https://supabase.com
➜ Login → Seu projeto → SQL Editor
```

### **Passo 2: Executar SQL**
```
📄 Abrir: SQL_SOFT_DELETE_RECEITAS.sql
➜ Ctrl+A → Ctrl+C (copiar tudo)
➜ Colar no SQL Editor
▶ Clicar "Run"
```

### **Passo 3: Aguardar**
```
✅ SOFT DELETE CONFIGURADO
📊 ESTATÍSTICAS
🎉 PRONTO!
```

---

## 🎯 **O Que Muda:**

### **ANTES:**
```
[Deletar] ← Dá erro se tem vendas
```

### **DEPOIS:**
```
[Desativar] ← Sempre funciona!
   ↓
Receita fica "inativa"
Não aparece mais no app
Mas histórico de vendas fica salvo
```

---

## 📊 **Exemplo:**

### **Situação:**
```
Receita: Bolo de Trigo
Vendas: 15 vezes
Total faturado: R$ 752,00
```

### **Você quer remover do app:**
```
1. Clica em "Desativar"
2. Sistema marca: ativo = FALSE
3. Receita não aparece mais na lista
4. Histórico de vendas preservado ✅
5. Relatórios continuam corretos ✅
```

### **Se quiser voltar:**
```
1. Acessa "Receitas Desativadas"
2. Clica em "Reativar"
3. Receita volta a aparecer
```

---

## 🔧 **O Que o SQL Adiciona:**

### **Colunas Novas:**
```sql
ativo: TRUE/FALSE
data_desativacao: quando foi desativada
motivo_desativacao: "Produto descontinuado"
```

### **Funções Novas:**
```sql
desativar_receita(id, motivo)
reativar_receita(id)
```

### **Views Novas:**
```sql
receitas_ativas (só as ativas)
receitas_desativadas (com estatísticas)
```

---

## 🧪 **Teste:**

### **Antes de executar o SQL:**
```
Tentar deletar "Bolo de Trigo"
❌ Erro de foreign key
```

### **Depois de executar o SQL:**
```typescript
// Desativar
await supabase.rpc('desativar_receita', {
  receita_id_param: 'uuid-da-receita',
  motivo_param: 'Produto descontinuado'
})

✅ Sucesso!
✅ Receita desativada
✅ Histórico preservado
```

---

## 📋 **Checklist:**

- [ ] Executar `SQL_SOFT_DELETE_RECEITAS.sql` no Supabase
- [ ] Ver confirmação "SOFT DELETE CONFIGURADO"
- [ ] Tentar desativar uma receita (vai funcionar!)
- [ ] Verificar que não aparece mais na lista
- [ ] Verificar que histórico de vendas está preservado

---

## 🎉 **Resultado:**

ANTES:
```
❌ Erro ao deletar receitas vendidas
❌ Sem opção para remover do app
❌ Ou perde histórico, ou não pode remover
```

DEPOIS:
```
✅ Desativa receitas com segurança
✅ Remove do app sem perder dados
✅ Histórico 100% preservado
✅ Pode reativar quando quiser
✅ Relatórios sempre corretos
```

---

## 📁 **Arquivos:**

1. **`SQL_SOFT_DELETE_RECEITAS.sql`** ← EXECUTE ESTE!
2. **`GUIA_SOFT_DELETE.md`** ← Guia completo
3. **`SOLUCAO_ERRO_DELETE_RECEITA.md`** ← Este arquivo

---

**Execute agora e resolva o erro definitivamente!** 🚀

