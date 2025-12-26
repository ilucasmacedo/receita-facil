/**
 * Script para criar a conta de teste no Supabase
 * Execute: node scripts/create-test-user.js
 */

const path = require('path')
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

// Ler o arquivo .env.local manualmente
const envPath = path.join(__dirname, '..', '.env.local')
let supabaseUrl = ''
let supabaseAnonKey = ''

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const lines = envContent.split('\n')
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim()
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.split('=')[1].trim()
    }
  })
} else {
  // Tentar também com dotenv como fallback
  require('dotenv').config({ path: envPath })
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!')
  console.log('\n📝 Certifique-se de que o arquivo .env.local existe e contém:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=sua_url')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTestUser() {
  console.log('🚀 Criando conta de teste no Supabase...\n')
  
  const testEmail = 'teste@teste.com'
  const testPassword = '123456'

  try {
    // Tentar criar a conta
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (error) {
      // Se o erro for que o usuário já existe, tentar fazer login
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        console.log('ℹ️  Conta já existe. Tentando fazer login para verificar...\n')
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        })

        if (loginError) {
          console.error('❌ Erro ao fazer login:', loginError.message)
          console.log('\n💡 A conta pode existir mas com senha diferente.')
          console.log('   Você pode resetar a senha no painel do Supabase ou criar manualmente.')
          process.exit(1)
        }

        console.log('✅ Conta de teste já existe e está funcionando!')
        console.log(`   Email: ${testEmail}`)
        console.log(`   Senha: ${testPassword}\n`)
        return
      }
      
      throw error
    }

    if (data.user) {
      console.log('✅ Conta de teste criada com sucesso!')
      console.log(`   Email: ${testEmail}`)
      console.log(`   Senha: ${testPassword}`)
      console.log(`   User ID: ${data.user.id}\n`)
      
      if (data.user.email_confirmed_at) {
        console.log('✅ Email confirmado automaticamente!')
      } else {
        console.log('⚠️  Nota: Você pode precisar confirmar o email no painel do Supabase.')
        console.log('   Vá em Authentication > Users e confirme manualmente se necessário.\n')
      }
    }
  } catch (error) {
    console.error('❌ Erro ao criar conta:', error.message)
    process.exit(1)
  }
}

createTestUser()

