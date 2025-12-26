# 🧹 Guia: Limpar Banco de Dados para Teste Completo

## 📋 Duas Opções Disponíveis

### Opção 1: Limpar APENAS os Dados (Rápido)
**Arquivo:** `SQL_LIMPAR_DADOS.sql`

**Use quando:**
- Quer testar novamente mas já sabe que as tabelas estão corretas
- Quer manter a estrutura e só apagar registros
- Rápido (30 segundos)

**O que faz:**
- ✅ Apaga todos os registros
- ✅ Mantém tabelas
- ✅ Mantém políticas RLS
- ✅ Mantém funções e triggers
- ❌ Não recria estrutura

---

### Opção 2: Reset COMPLETO (Do Zero)
**Arquivo:** `SQL_RESET_COMPLETO_ZERO.sql`

**Use quando:**
- Quer ter 100% de certeza que está correto
- Suspeita que tem erro na estrutura
- Quer começar do absoluto zero
- Mais demorado (2-3 minutos)

**O que faz:**
- ✅ Apaga TUDO (tabelas, políticas, funções, triggers, views)
- ✅ Recria TUDO do zero
- ✅ Estrutura 100% atualizada
- ✅ Todas as correções aplicadas

---

## 🎯 Recomendação para TESTE COMPLETO

**Use:** `SQL_RESET_COMPLETO_ZERO.sql`

**Por quê?**
- Garante que não tem nenhum resquício de erro anterior
- Todas as colunas, funções e triggers corretos
- Estado limpo e conhecido

---

## 📝 Passo a Passo: Reset Completo

### 1. Backup (Opcional mas Recomendado)

Se tiver dados importantes:

```
Supabase → Database → Backups → Create Backup
```

### 2. Executar o SQL

1. Vá para **Supabase Dashboard**
2. Menu lateral: **SQL Editor**
3. Clique em **"New query"**
4. Abra o arquivo: `SQL_RESET_COMPLETO_ZERO.sql`
5. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
6. Cole no SQL Editor
7. Clique em **"Run"** (ou F5)
8. Aguarde 2-3 minutos (é um SQL grande)

### 3. Limpar Fotos (Storage)

**Manual:**

1. Vá para **Storage** no Supabase
2. Clique em **receitas-fotos**
3. Selecione todas as fotos
4. Clique em **"Delete"**

### 4. Verificar

O SQL já faz verificação automática no final. Você deve ver:

```
✅ Tabelas criadas
✅ Funções criadas
✅ Triggers criados
```

---

## 🧪 Fluxo de Teste Completo Sugerido

Após limpar o banco:

### 1. Login/Auth (2 min)
- Criar conta nova
- Fazer login
- Testar "Acesso Master"

### 2. Insumos (5 min)
- Cadastrar 3-5 insumos manualmente
- Testar conversão (kg→g, L→ml)
- Importar CSV (5-10 itens)
- Testar filtros
- Testar edição
- Verificar histórico de compras

### 3. Modelos (5 min)
- Criar 2-3 modelos/receitas
- Adicionar foto em pelo menos 1
- Adicionar insumos a cada modelo
- Verificar cálculo automático de custo
- Testar filtros (tipo, nome)

### 4. Produção (3 min)
- Ir para aba "Produtos"
- Alternar para "Produzir Produtos"
- Produzir 5-10 unidades de 1 modelo
- Verificar dedução de insumos
- Verificar aumento de estoque de produtos

### 5. Vendas (3 min)
- Ir para aba "Vendas"
- Adicionar produtos ao carrinho
- Finalizar venda
- Verificar dedução de estoque de produtos
- Ver histórico de vendas

### 6. Dashboard (2 min)
- Ver estatísticas atualizadas
- Testar filtros de período
- Verificar alertas de estoque baixo

### 7. Mobile (2 min)
- Abrir no celular
- Testar navegação
- Verificar responsividade

---

## ⚠️ Checklist Antes de Limpar

- [ ] Tem certeza que quer apagar TUDO?
- [ ] Fez backup (se necessário)?
- [ ] Sabe o login de teste (teste@teste.com / 123456)?
- [ ] Tem CSVs de exemplo para importar?
- [ ] Tem fotos de teste para upload?

---

## ✅ Depois de Executar

### Resultado Esperado:

```
✅ Banco limpo
✅ Estrutura 100% atualizada
✅ Todas as tabelas existem
✅ Todas as políticas RLS corretas
✅ Todos os triggers funcionando
✅ Todas as funções criadas
✅ Views criadas
✅ Índices otimizados
```

### Contadores:

```sql
ingredientes: 0
receitas: 0
itens_receita: 0
historico_compras: 0
vendas: 0
itens_venda: 0
producoes: 0
historico_estoque: 0
```

---

## 🚨 Se Der Erro

### Erro: "permission denied"
- Verifique se está logado como Owner do projeto

### Erro: "relation does not exist"
- Normal! Significa que já estava limpo
- Continue executando o SQL

### Erro: "cannot drop ... because other objects depend on it"
- Use `SQL_RESET_COMPLETO_ZERO.sql` (tem CASCADE)

---

## 📊 Estrutura Completa (Referência)

### Tabelas (8):
1. `ingredientes` - Insumos/matéria-prima
2. `receitas` - Modelos de produção
3. `itens_receita` - Ingredientes por receita
4. `historico_compras` - Histórico de compras
5. `vendas` - Vendas realizadas
6. `itens_venda` - Itens vendidos
7. `producoes` - Histórico de produção
8. `historico_estoque` - Movimentações de estoque

### Funções (4):
1. `recalcular_custo_receita` - Calcular custo/preço
2. `marcar_receitas_para_atualizacao` - Marcar para recálculo
3. `registrar_producao` - Produzir produtos
4. `deduzir_estoque_venda_produtos` - Deduzir estoque em vendas

### Triggers (2):
1. `trigger_ingrediente_alterado` - Atualizar receitas
2. `trigger_deduzir_estoque_venda` - Deduzir em vendas

### Views (3):
1. `receitas_desativadas` - Receitas inativas
2. `alertas_estoque_insumos` - Alertas de insumos
3. `alertas_estoque_produtos` - Alertas de produtos

---

**Tempo total:** ~5 minutos (SQL + limpeza manual storage)  
**Recomendação:** Execute `SQL_RESET_COMPLETO_ZERO.sql` para teste completo

