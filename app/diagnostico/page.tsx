'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function DiagnosticoPage() {
  const { user, loading: authLoading } = useAuth()
  const [checks, setChecks] = useState<Record<string, { status: 'checking' | 'ok' | 'error', message: string }>>({})

  useEffect(() => {
    if (!authLoading) {
      runDiagnostics()
    }
  }, [authLoading, user])

  const runDiagnostics = async () => {
    const newChecks: Record<string, { status: 'checking' | 'ok' | 'error', message: string }> = {}

    // 1. Verificar autenticação
    newChecks.auth = { status: 'checking', message: 'Verificando autenticação...' }
    setChecks({ ...newChecks })

    if (!user) {
      newChecks.auth = { status: 'error', message: 'Usuário não está autenticado' }
    } else {
      newChecks.auth = { status: 'ok', message: `Usuário autenticado: ${user.email} (ID: ${user.id})` }
    }
    setChecks({ ...newChecks })

    // 2. Verificar variáveis de ambiente
    newChecks.env = { status: 'checking', message: 'Verificando variáveis de ambiente...' }
    setChecks({ ...newChecks })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      newChecks.env = { status: 'error', message: 'Variáveis de ambiente não configuradas' }
    } else {
      newChecks.env = { status: 'ok', message: 'Variáveis de ambiente configuradas' }
    }
    setChecks({ ...newChecks })

    // 3. Verificar conexão com Supabase
    newChecks.connection = { status: 'checking', message: 'Testando conexão com Supabase...' }
    setChecks({ ...newChecks })

    try {
      const { data, error } = await supabase.from('ingredientes').select('count', { count: 'exact', head: true })
      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          newChecks.connection = { status: 'error', message: 'Schema cache desatualizado. Execute SQL_FIX_SCHEMA_CACHE.sql no Supabase!' }
        } else {
          newChecks.connection = { status: 'error', message: `Erro: ${error.message}` }
        }
      } else {
        newChecks.connection = { status: 'ok', message: 'Conexão com Supabase OK. Tabela existe.' }
      }
    } catch (error: any) {
      newChecks.connection = { status: 'error', message: `Erro de conexão: ${error.message}` }
    }
    setChecks({ ...newChecks })

    // 4. Verificar permissões (RLS)
    if (user) {
      newChecks.permissions = { status: 'checking', message: 'Verificando permissões (RLS)...' }
      setChecks({ ...newChecks })

      try {
        const { data, error } = await supabase
          .from('ingredientes')
          .insert({ 
            user_id: user.id, 
            nome: 'TESTE_DIAGNOSTICO', 
            preco_compra: 1, 
            quantidade_total: 1, 
            unidade: 'g' 
          })
          .select()

        if (error) {
          if (error.message.includes('row-level security') || error.message.includes('policy')) {
            newChecks.permissions = { status: 'error', message: 'Políticas RLS não configuradas. Execute o SQL completo!' }
          } else if (error.message.includes('schema cache')) {
            newChecks.permissions = { status: 'error', message: 'Schema cache desatualizado. Execute SQL_FIX_SCHEMA_CACHE.sql e aguarde 15 segundos!' }
          } else {
            newChecks.permissions = { status: 'error', message: `Erro de permissão: ${error.message}` }
          }
        } else {
          // Deletar o registro de teste
          if (data && data[0]) {
            await supabase.from('ingredientes').delete().eq('id', data[0].id)
          }
          newChecks.permissions = { status: 'ok', message: 'Permissões OK. Você pode inserir dados!' }
        }
      } catch (error: any) {
        newChecks.permissions = { status: 'error', message: `Erro: ${error.message}` }
      }
      setChecks({ ...newChecks })
    }
  }

  const getStatusIcon = (status: 'checking' | 'ok' | 'error') => {
    if (status === 'checking') return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    if (status === 'ok') return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (status: 'checking' | 'ok' | 'error') => {
    if (status === 'checking') return 'bg-blue-50 border-blue-200'
    if (status === 'ok') return 'bg-green-50 border-green-200'
    return 'bg-red-50 border-red-200'
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Diagnóstico do Sistema</h1>

      <div className="space-y-4 mb-6">
        {Object.entries(checks).map(([key, check]) => (
          <div
            key={key}
            className={`p-4 rounded-lg border-2 ${getStatusColor(check.status)}`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(check.status)}
              <div className="flex-1">
                <h3 className="font-semibold capitalize mb-1">{key}</h3>
                <p className="text-sm">{check.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {checks.connection?.status === 'error' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="font-bold text-lg mb-3 text-yellow-800">⚠️ Tabela não encontrada!</h2>
          <p className="mb-4 text-yellow-700">
            Você precisa criar a tabela no Supabase. Siga estes passos:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700 mb-4">
            <li>Acesse o SQL Editor no Supabase</li>
            <li>Execute o SQL do arquivo <code className="bg-yellow-100 px-2 py-1 rounded">SQL_CRIAR_TABELA_INGREDIENTES.sql</code></li>
            <li>Recarregue esta página</li>
          </ol>
        </div>
      )}

      {checks.permissions?.status === 'error' && checks.permissions.message.includes('schema cache') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="font-bold text-lg mb-3 text-red-800">🔴 Schema Cache Desatualizado!</h2>
          <p className="mb-4 text-red-700">
            O Supabase precisa atualizar o cache do schema. Execute este SQL:
          </p>
          <div className="bg-gray-800 text-green-400 p-4 rounded-lg mb-4 overflow-x-auto">
            <code className="text-sm">
              Execute o arquivo: <strong>SQL_FIX_SCHEMA_CACHE.sql</strong>
            </code>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-red-700 mb-4">
            <li>Abra o SQL Editor no Supabase</li>
            <li>Execute o SQL do arquivo <code className="bg-red-100 px-2 py-1 rounded">SQL_FIX_SCHEMA_CACHE.sql</code></li>
            <li><strong>Aguarde 15 segundos</strong> após executar</li>
            <li>Recarregue esta página (F5)</li>
          </ol>
        </div>
      )}

      {checks.permissions?.status === 'error' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="font-bold text-lg mb-3 text-yellow-800">⚠️ Políticas RLS não configuradas!</h2>
          <p className="mb-4 text-yellow-700">
            As políticas de segurança (RLS) não estão configuradas. Execute o SQL completo no Supabase.
          </p>
        </div>
      )}

      <button
        onClick={runDiagnostics}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
      >
        Executar Diagnóstico Novamente
      </button>
    </div>
  )
}

