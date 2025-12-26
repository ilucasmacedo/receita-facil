# 🍰 Receita Fácil

> Sistema de gestão de receitas e precificação para pequenos empreendedores culinários

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Sobre o Projeto

**Receita Fácil** é um Micro-SaaS desenvolvido para ajudar pequenos empreendedores do setor alimentício a gerenciar receitas, calcular custos automaticamente e precificar produtos com precisão.

### ✨ Principais Funcionalidades

- 📦 **Gestão de Insumos** - Cadastro com conversão automática (kg→g, L→ml)
- 📝 **Modelos de Produção** - Receitas com cálculo automático de custo e preço
- 🏭 **Controle de Produção** - Transformação de insumos em produtos prontos
- 📊 **Estoque Inteligente** - Rastreamento de matéria-prima e produtos finais
- 💰 **Vendas** - Registro com dedução automática de estoque
- 📈 **Dashboard** - Análise de vendas, lucro e alertas de estoque
- 📸 **Upload de Fotos** - Imagens para cada receita
- 🔍 **Filtros Avançados** - Por nome, tipo, período, valores
- 📱 **Mobile-First** - Design responsivo para uso em qualquer dispositivo
- 🔒 **Multi-Usuário** - Isolamento total de dados por usuário (RLS)
- 📥 **Importação CSV** - Upload em massa de insumos

---

## 🚀 Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage
- **Ícones:** Lucide React

---

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- Conta no Supabase (gratuita)

### 1. Clone o Repositório

```bash
git clone https://github.com/SEU_USUARIO/receita-facil.git
cd receita-facil
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

**Onde encontrar:**
1. Vá para [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings → API**
4. Copie a `URL` e `anon/public key`

### 4. Configure o Banco de Dados

Execute os seguintes SQLs no **Supabase SQL Editor** (nesta ordem):

1. **Criar estrutura:**
   ```bash
   SQL_CRIAR_ESTRUTURA.sql
   ```

2. **Criar bucket de fotos:**
   ```bash
   SQL_STORAGE_FOTOS_RECEITAS.sql
   ```

3. **Criar bucket manualmente:**
   - Vá para **Storage** no Supabase
   - Clique em **"Create bucket"**
   - Nome: `receitas-fotos`
   - **Public:** ✅ Marcado
   - Criar

### 5. Execute o Projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Credenciais de Teste

Para testar rapidamente, use o botão **"Acesso Master (Teste)"** na tela de login:

```
Email: teste@teste.com
Senha: 123456
```

Ou crie uma nova conta diretamente no aplicativo.

---

## 📖 Como Usar

### 1. Cadastrar Insumos
- Acesse **Insumos**
- Adicione ingredientes/embalagens com preço e quantidade
- Sistema converte automaticamente unidades

### 2. Criar Modelos (Receitas)
- Acesse **Modelos**
- Crie receitas adicionando insumos
- Sistema calcula custo e preço de venda automaticamente

### 3. Produzir Produtos
- Acesse **Produtos**
- Selecione um modelo e quantidade a produzir
- Sistema deduz insumos e adiciona ao estoque de prontos

### 4. Registrar Vendas
- Acesse **Vendas**
- Adicione produtos ao carrinho
- Finalize venda (deduz automaticamente do estoque)

### 5. Visualizar Dashboard
- Veja estatísticas de vendas
- Alertas de estoque baixo
- Filtre por período

---

## 📊 Arquitetura do Banco

```
ingredientes (insumos/matéria-prima)
├── receitas (modelos de produção)
│   └── itens_receita
├── producoes (histórico de produção)
├── vendas
│   └── itens_venda
└── historico_estoque
```

**Segurança:**
- RLS (Row Level Security) ativo
- Cada usuário vê apenas seus dados
- Políticas aplicadas no nível do banco

---

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento (localhost:3000)
npm run build        # Build para produção
npm run start        # Iniciar build de produção
npm run lint         # Verificar erros de lint
```

---

## 📁 Estrutura do Projeto

```
receita-facil/
├── app/                    # Páginas e rotas (App Router)
│   ├── page.tsx           # Dashboard
│   ├── login/             # Autenticação
│   ├── ingredientes/      # Insumos
│   ├── receitas/          # Modelos
│   ├── produtos/          # Produção e Estoque
│   └── vendas/            # Vendas e Histórico
├── components/            # Componentes React
│   ├── Navbar.tsx
│   ├── FiltroGenerico.tsx
│   └── UploadFoto.tsx
├── lib/                   # Utilitários
│   ├── supabase.ts        # Cliente Supabase
│   ├── filtros-utils.ts   # Funções de filtro
│   └── image-utils.ts     # Processamento de imagens
├── types/                 # Tipos TypeScript
│   └── database.ts        # Interfaces do banco
├── public/                # Arquivos estáticos
└── *.sql                  # Scripts SQL (documentação)
```

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push para o GitHub
2. Vá para [Vercel](https://vercel.com)
3. Importe o repositório
4. Adicione as variáveis de ambiente
5. Deploy automático!

### Variáveis de Ambiente no Vercel

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🧪 Testes

Para limpar dados e testar do zero:

```sql
-- Execute no Supabase SQL Editor
-- Ver: SQL_LIMPAR_APENAS_DADOS.sql
```

---

## 📝 Documentação Adicional

- `GUIA_COMPLETO_FILTROS.md` - Sistema de filtros
- `SEGURANCA_MULTI_USUARIO.md` - Segurança e RLS
- `GUIA_UPLOAD_FOTOS_RECEITAS.md` - Upload de imagens
- `ANALISE_CUSTOS_100_USUARIOS.md` - Análise de custos

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👤 Autor

Desenvolvido como parte de um projeto de Micro-SaaS para empreendedores culinários.

---

## 🌟 Roadmap

- [ ] Relatórios em PDF
- [ ] Integração com WhatsApp (notificações)
- [ ] App mobile nativo
- [ ] Sistema de etiquetas/tags
- [ ] Multi-idiomas
- [ ] Tema escuro (opcional)

---

## 📞 Suporte

Para dúvidas e suporte:
- Abra uma [Issue](https://github.com/SEU_USUARIO/receita-facil/issues)
- Consulte a documentação na pasta do projeto

---

<p align="center">
  Feito com ❤️ e ☕
</p>

