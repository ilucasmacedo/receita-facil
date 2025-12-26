# 📸 Guia: Upload de Fotos para Receitas

## ✅ Sistema Implementado

---

## 🎯 Funcionalidades

- ✅ Upload de fotos para Supabase Storage
- ✅ Redimensionamento automático (400x400px)
- ✅ Crop quadrado focando no centro
- ✅ Conversão para JPEG otimizado (80% qualidade)
- ✅ Preview em tempo real
- ✅ Validação de formato e tamanho
- ✅ Limite de 5 MB por foto
- ✅ Formatos aceitos: JPG, PNG, WebP

---

## 📋 Pré-Requisitos

### 1. Criar Bucket no Supabase

**Passo a Passo:**

1. Acesse Supabase Dashboard
2. Vá para **Storage**
3. Clique em **"Create a new bucket"**
4. Configurações:
   - **Name**: `receitas-fotos`
   - **Public**: ✅ **SIM** (marque esta opção)
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
5. Clique em **"Create bucket"**

### 2. Configurar Políticas de Segurança (RLS)

Execute este SQL no **SQL Editor** do Supabase:

```sql
-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Usuários podem fazer upload de fotos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receitas-fotos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir leitura pública
CREATE POLICY "Fotos são públicas para leitura"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'receitas-fotos');

-- Permitir atualização apenas do próprio usuário
CREATE POLICY "Usuários podem atualizar suas fotos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'receitas-fotos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'receitas-fotos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir exclusão apenas do próprio usuário
CREATE POLICY "Usuários podem deletar suas fotos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'receitas-fotos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 🧩 Componentes Criados

### 1. `lib/image-utils.ts`

Utilitários para processar imagens:

```typescript
// Processar e redimensionar imagem
processarImagem(file, size, quality): Promise<Blob>

// Validar arquivo
validarImagem(file, maxSizeMB): { valido, erro }

// Gerar nome único
gerarNomeArquivo(userId, receitaId): string

// Criar/liberar preview
criarPreview(file): string
liberarPreview(url): void

// Formatar tamanho
formatarTamanho(bytes): string
```

### 2. `components/UploadFoto.tsx`

Componente de upload reutilizável:

```tsx
<UploadFoto
  userId={user.id}
  receitaId={receita.id} // Opcional
  fotoAtual={receita.foto_url}
  onUploadSuccess={(url) => {
    // Salvar URL no formulário
    setFormData({ ...formData, foto_url: url })
  }}
  onRemove={() => {
    // Remover foto
    setFormData({ ...formData, foto_url: '' })
  }}
/>
```

### 3. Integração em `app/receitas/page.tsx`

Substituiu o campo de URL manual por upload direto.

---

## 🎨 Como Usar (Usuário Final)

### Cadastrar Receita com Foto:

1. Acesse **Modelos**
2. Preencha o formulário
3. Na seção **"Foto da Receita"**:
   - Clique em **"Adicionar Foto"**
   - Selecione uma imagem (JPG, PNG ou WebP)
   - Aguarde o processamento (barra de progresso)
   - Preview aparece automaticamente
4. Clique em **"Salvar Receita"**

### Trocar Foto:

1. Edite a receita
2. Clique em **"Trocar Foto"**
3. Selecione nova imagem
4. Aguarde processamento
5. Salve

### Remover Foto:

1. Clique no **X vermelho** no canto da foto
2. Preview desaparece
3. Salve (foto será removida)

---

## 🔧 Processamento Automático

### O que acontece ao fazer upload:

```
1. Upload do arquivo original (ex: 2MB, 3000x2000px)
   ↓
2. Validação (formato, tamanho máximo 5MB)
   ↓
3. Crop quadrado no centro
   ↓
4. Redimensionamento para 400x400px
   ↓
5. Conversão para JPEG (80% qualidade)
   ↓
6. Upload para Supabase Storage (~50KB)
   ↓
7. URL pública salva no banco de dados
```

### Exemplo de Crop Central:

```
Imagem Original (1200x800px):
┌──────────────────────┐
│                      │
│   ┌──────────┐       │ ← Crop
│   │   800x   │       │   (menor dimensão)
│   │   800px  │       │
│   └──────────┘       │
│                      │
└──────────────────────┘

Resultado (400x400px):
┌──────────┐
│          │
│  Imagem  │
│ Quadrada │
│          │
└──────────┘
```

---

## 📊 Estrutura de Armazenamento

### Organização de Arquivos:

```
receitas-fotos/
├── {user_id}/
│   ├── {receita_id}_1234567890.jpg
│   ├── {receita_id}_1234567891.jpg
│   └── temp_1234567892_abc123.jpg
└── ...
```

### Exemplo de URL Pública:

```
https://zqcjwaudqidtvtmbczim.supabase.co/storage/v1/object/public/receitas-fotos/123e4567-e89b-12d3-a456-426614174000/receita-001_1234567890.jpg
```

---

## 🔒 Segurança (RLS)

### Políticas Implementadas:

| Ação | Quem Pode | Validação |
|------|-----------|-----------|
| **Upload** | Usuário autenticado | Apenas na sua pasta |
| **Leitura** | Público | Qualquer pessoa (foto pública) |
| **Atualização** | Dono da foto | Apenas suas fotos |
| **Exclusão** | Dono da foto | Apenas suas fotos |

**Exemplo:**
- Usuário A pode fazer upload em `receitas-fotos/user-A/`
- Usuário A **NÃO** pode fazer upload em `receitas-fotos/user-B/`
- Qualquer pessoa pode **ver** as fotos (público)

---

## 🧪 Testes

### Checklist de Testes:

#### Upload:
- [ ] Fazer upload de JPG
- [ ] Fazer upload de PNG
- [ ] Fazer upload de WebP
- [ ] Verificar crop central (fotos retangulares)
- [ ] Verificar redimensionamento (400x400px)
- [ ] Verificar tamanho final (~50KB)

#### Validação:
- [ ] Tentar upload de arquivo grande (>5MB) → Erro
- [ ] Tentar upload de formato inválido (PDF) → Erro
- [ ] Tentar upload sem estar logado → Erro

#### Preview:
- [ ] Preview aparece após upload
- [ ] Botão "Trocar Foto" funciona
- [ ] Botão "X" remove foto
- [ ] Preview persiste ao editar receita

#### Segurança:
- [ ] Usuário A não pode deletar fotos de B
- [ ] Fotos são públicas (aparecem na lista)
- [ ] RLS bloqueia acesso indevido

---

## ⚠️ Limitações Conhecidas

### Tamanhos:
- **Máximo por foto**: 5 MB
- **Tamanho final**: ~50-100 KB (após otimização)
- **Dimensões**: 400x400px (quadrado)

### Formatos:
- **Aceitos**: JPG, PNG, WebP
- **Saída**: Sempre JPEG (otimizado)

### Quota do Supabase (Free Tier):
- **Storage**: 1 GB total
- **Bandwidth**: 2 GB/mês
- **Estimativa**: ~20.000 fotos (50KB cada)

---

## 📈 Performance

### Otimizações Implementadas:

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Tamanho | 2 MB | 50 KB |
| Dimensões | 3000x2000px | 400x400px |
| Formato | PNG | JPEG |
| Qualidade | 100% | 80% |
| Tempo de Upload | ~5s | ~1s |

---

## 🚀 Melhorias Futuras (Opcional)

- [ ] Suporte a múltiplas fotos por receita
- [ ] Galeria de fotos
- [ ] Filtros e ajustes (brilho, contraste)
- [ ] Upload por arrastar e soltar (drag & drop)
- [ ] Integração com Unsplash (fotos gratuitas)
- [ ] Compressão ainda mais agressiva (WebP)
- [ ] CDN para servir imagens mais rápido

---

## 📝 Resumo de Arquivos

### Criados:
- ✅ `SQL_STORAGE_FOTOS_RECEITAS.sql` - Setup do Storage
- ✅ `lib/image-utils.ts` - Utilitários de imagem
- ✅ `components/UploadFoto.tsx` - Componente de upload
- ✅ `GUIA_UPLOAD_FOTOS_RECEITAS.md` - Este guia

### Modificados:
- ✅ `app/receitas/page.tsx` - Integração do upload

---

## ✅ Status

| Tarefa | Status |
|--------|--------|
| SQL Setup | ✅ Criado |
| Utilitários | ✅ Criado |
| Componente | ✅ Criado |
| Integração | ✅ Concluído |
| Documentação | ✅ Concluído |
| **Testes pelo Usuário** | ⏳ Pendente |

---

**Próximo Passo:** 
1. Execute o SQL no Supabase
2. Crie o bucket "receitas-fotos"
3. Teste o upload no formulário de receitas

🎉 **Sistema de Upload Pronto!**

