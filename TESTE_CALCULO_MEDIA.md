# 🧪 Teste: Cálculo de Média e Soma

## Passo a Passo para Testar

### 1. Adicionar Ingrediente Inicial
1. Vá em **Ingredientes**
2. Adicione:
   - Nome: `Teste Média`
   - Preço: `10.00`
   - Quantidade: `2`
   - Unidade: `Quilogramas (kg)`
3. Clique em "Adicionar Ingrediente"
4. ✅ Deve aparecer na tabela: **2000g por R$ 10,00**

### 2. Adicionar Mesma Quantidade com Preço Diferente
1. Tente adicionar novamente:
   - Nome: `Teste Média`
   - Preço: `12.00`
   - Quantidade: `1`
   - Unidade: `Quilogramas (kg)`
2. Clique em "Adicionar Ingrediente"
3. ✅ Modal deve aparecer mostrando:
   - **Valores Existentes:** R$ 10,00 | 2000g
   - **Novos Valores:** R$ 12,00 | 1000g

### 3. Calcular Média
1. No modal, clique em **"Calcular Média de Preço e Somar Quantidades"**
2. ✅ **Resultado Esperado:**
   - **Novo Preço:** R$ 11,00 (média de 10 e 12)
   - **Nova Quantidade:** 3000g (soma de 2000 + 1000)

### 4. Verificar na Tabela
1. Olhe na tabela
2. ✅ Deve mostrar:
   - Nome: Teste Média
   - Preço: **R$ 11,00**
   - Quantidade: **3kg** (ou 3000g)
   - Custo unitário: **R$ 0,0037/g** (11,00 / 3000)

---

## Cálculo Detalhado

### Média de Preço
```
(Preço Antigo + Preço Novo) / 2
(10,00 + 12,00) / 2 = 11,00
```

### Soma de Quantidade
```
Quantidade Antiga + Quantidade Nova
2000g + 1000g = 3000g
```

### Custo Unitário Novo
```
Preço Total / Quantidade Total
11,00 / 3000 = 0,0037 por grama
```

---

## Por Que Isso é Útil?

### Exemplo Real de Padaria:

**Compra 1 (Segunda-feira):**
- 5kg de farinha por R$ 25,00

**Compra 2 (Quinta-feira):**
- 3kg de farinha por R$ 18,00

**Com a média:**
- Preço médio: (25 + 18) / 2 = **R$ 21,50**
- Quantidade total: 5kg + 3kg = **8kg**
- **Custo real por kg: R$ 2,69**

Isso reflete o **custo médio do seu estoque**, que é o que você deve usar para precificar suas receitas!

---

## Teste Agora!

1. Execute o teste acima
2. Veja os números mudarem
3. Confirme que a matemática está correta

Se quiser, me envie uma screenshot do resultado e eu confirmo se está funcionando perfeitamente! 📊

