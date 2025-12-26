# 🗑️ GUIA: Soft Delete (Desativar em vez de Deletar)

## ❌ **O Problema:**

Quando você tenta **deletar** uma receita que já foi vendida:

```
❌ ERRO: violates foreign key constraint
```

**Motivo:** A receita tem vendas registradas. Se deletar, perde o histórico financeiro!

---

## ✅ **A Solução: SOFT DELETE**

Em vez de **deletar permanentemente**, você **desativa** a receita:

```
ANTES (Delete):
❌ Receita apagada para sempre
❌ Histórico de vendas quebrado
❌ Relatórios financeiros incorretos

DEPOIS (Soft Delete):
✅ Receita marcada como "inativa"
✅ Histórico de vendas preservado
✅ Relatórios financeiros corretos
✅ Pode reativar se quiser
```

---

## 🎯 **Como Funciona:**

### **1. Coluna `ativo`**
```sql
ativo: TRUE  = Receita ativa (aparece no app)
ativo: FALSE = Receita desativada (não aparece, mas existe)
```

### **2. Coluna `data_desativacao`**
Registra quando foi desativada

### **3. Coluna `motivo_desativacao`**
Opcional: "Produto descontinuado", "Vendas baixas", etc.

---

## 📋 **INSTALAÇÃO (1 minuto):**

### **Passo 1: Abrir Supabase SQL Editor**

### **Passo 2: Executar SQL**
```
📄 SQL_SOFT_DELETE_RECEITAS.sql
➜ Copiar tudo
➜ Colar no Supabase
➜ Clicar "Run"
```

### **Passo 3: Aguardar Confirmações**
```
✅ SOFT DELETE CONFIGURADO
📊 ESTATÍSTICAS
✅ COLUNAS ADICIONADAS
✅ FUNÇÕES CRIADAS
🎉 PRONTO!
```

---

## 🎨 **Como Usar no App:**

### **ANTES (Delete Direto):**
```
[Deletar] ← Dava erro se tinha vendas
```

### **DEPOIS (Soft Delete):**
```
[Desativar] ← Sempre funciona!
```

---

## 🔧 **Funções Criadas:**

### **1. `desativar_receita(receita_id, motivo)`**
Desativa uma receita e retorna estatísticas:
- Total de vendas
- Quantidade vendida
- Total faturado

**Exemplo:**
```sql
SELECT * FROM desativar_receita(
  '123e4567-e89b-12d3-a456-426614174000',
  'Produto descontinuado'
);
```

**Retorno:**
```
sucesso: TRUE
mensagem: "Receita 'Bolo de Trigo' desativada com sucesso"
total_vendas: 15
quantidade_vendida: 47
total_faturado: R$ 752,00
```

---

### **2. `reativar_receita(receita_id)`**
Reativa uma receita desativada

**Exemplo:**
```sql
SELECT * FROM reativar_receita(
  '123e4567-e89b-12d3-a456-426614174000'
);
```

---

## 📊 **Views Criadas:**

### **1. `receitas_ativas`**
Lista apenas receitas ativas (usada no app)

```sql
SELECT * FROM receitas_ativas;
```

### **2. `receitas_desativadas`**
Lista receitas desativadas COM estatísticas

```sql
SELECT * FROM receitas_desativadas;
```

**Retorna:**
- Dados da receita
- Total de vendas
- Quantidade vendida
- Total faturado

---

## 🧪 **Teste Completo:**

### **Situação de Teste:**

**1. Receita:**
```
Nome: Bolo de Trigo
Vendas: 15 vezes
Quantidade vendida: 47 unidades
Faturamento: R$ 752,00
```

**2. Tentar deletar:**
```
❌ Erro: violates foreign key constraint
```

**3. Executar SQL de Soft Delete**

**4. Desativar receita:**
```typescript
// No app (depois que atualizarmos o código)
await desativarReceita(receitaId, 'Produto descontinuado')
```

**5. Resultado:**
```
✅ Receita desativada
✅ Histórico de vendas preservado
✅ Não aparece mais na lista de receitas ativas
✅ Pode ver em "Receitas Desativadas"
✅ Pode reativar se quiser
```

---

## 📈 **Benefícios:**

### **Financeiro:**
✅ Histórico de vendas completo
✅ Relatórios corretos
✅ Auditoria possível

### **Operacional:**
✅ Pode reativar produtos sazonais
✅ Análise de produtos descontinuados
✅ Métricas de performance

### **Legal:**
✅ Conformidade com legislação contábil
✅ Rastreabilidade completa
✅ Histórico para fiscalização

---

## 🎯 **Casos de Uso:**

### **Caso 1: Produto Sazonal**
```
Dezembro: Panetone ativo
Janeiro: Desativa Panetone
Novembro: Reativa Panetone
✅ Histórico de vendas de anos anteriores preservado
```

### **Caso 2: Teste de Mercado**
```
Lançamento: Bolo de Matcha (novo)
3 meses: Vendas baixas
Decisão: Desativar
✅ Dados salvos para análise futura
```

### **Caso 3: Mudança de Receita**
```
V1: Bolo de Chocolate (receita antiga)
Desativa V1
Cria V2: Bolo de Chocolate Premium
✅ Histórico de V1 preservado para comparar vendas
```

---

## 🔍 **Consultas Úteis:**

### **Ver todas as receitas ativas:**
```sql
SELECT * FROM receitas_ativas;
```

### **Ver receitas desativadas com stats:**
```sql
SELECT 
  nome,
  data_desativacao,
  motivo_desativacao,
  total_vendas,
  quantidade_vendida,
  total_faturado
FROM receitas_desativadas;
```

### **Estatísticas gerais:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE ativo = TRUE) as ativas,
  COUNT(*) FILTER (WHERE ativo = FALSE) as desativadas
FROM receitas;
```

---

## 🚀 **Próximos Passos:**

Após executar o SQL, vou atualizar o app para:

1. ✅ Mostrar apenas receitas ativas nas listas
2. ✅ Trocar botão "Deletar" por "Desativar"
3. ✅ Adicionar tela "Receitas Desativadas"
4. ✅ Permitir reativação
5. ✅ Mostrar estatísticas ao desativar

---

## 📊 **Comparação:**

| Ação | Delete Permanente | Soft Delete |
|------|-------------------|-------------|
| **Remove da lista** | ✅ | ✅ |
| **Mantém histórico** | ❌ | ✅ |
| **Preserva vendas** | ❌ | ✅ |
| **Pode reverter** | ❌ | ✅ |
| **Relatórios corretos** | ❌ | ✅ |
| **Auditoria** | ❌ | ✅ |

---

## 🎉 **Resultado:**

ANTES:
```
❌ Não pode deletar receitas vendidas
❌ Histórico quebrado se deletar
❌ Relatórios incorretos
```

DEPOIS:
```
✅ Desativa receitas com segurança
✅ Histórico 100% preservado
✅ Relatórios sempre corretos
✅ Pode reativar quando quiser
```

---

**Execute o SQL agora e nunca mais perca histórico de vendas!** 🚀

