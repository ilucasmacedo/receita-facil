'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function DiagnosticoVendasPage() {
  const { user, loading: authLoading } = useAuth()
  const [resultados, setResultados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      executarDiagnostico()
    }
  }, [user])

  const executarDiagnostico = async () => {
    if (!user) return
    setLoading(true)
    const testes: any[] = []

    // 1. Verificar se tabela vendas existe
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('count')
        .limit(1)
      
      if (error) {
        testes.push({
          nome: 'Tabela VENDAS',
          status: 'erro',
          mensagem: `Tabela não existe ou erro: ${error.message}`
        })
      } else {
        testes.push({
          nome: 'Tabela VENDAS',
          status: 'ok',
          mensagem: 'Tabela existe e acessível'
        })
      }
    } catch (error: any) {
      testes.push({
        nome: 'Tabela VENDAS',
        status: 'erro',
        mensagem: error.message
      })
    }

    // 2. Verificar se tabela itens_venda existe
    try {
      const { data, error } = await supabase
        .from('itens_venda')
        .select('count')
        .limit(1)
      
      if (error) {
        testes.push({
          nome: 'Tabela ITENS_VENDA',
          status: 'erro',
          mensagem: `Tabela não existe ou erro: ${error.message}`
        })
      } else {
        testes.push({
          nome: 'Tabela ITENS_VENDA',
          status: 'ok',
          mensagem: 'Tabela existe e acessível'
        })
      }
    } catch (error: any) {
      testes.push({
        nome: 'Tabela ITENS_VENDA',
        status: 'erro',
        mensagem: error.message
      })
    }

    // 3. Contar vendas do usuário
    try {
      const { data, error, count } = await supabase
        .from('vendas')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
      
      if (error) {
        testes.push({
          nome: 'Vendas do Usuário',
          status: 'erro',
          mensagem: error.message
        })
      } else {
        testes.push({
          nome: 'Vendas do Usuário',
          status: count && count > 0 ? 'ok' : 'aviso',
          mensagem: `${count || 0} vendas encontradas`,
          detalhes: data
        })
      }
    } catch (error: any) {
      testes.push({
        nome: 'Vendas do Usuário',
        status: 'erro',
        mensagem: error.message
      })
    }

    // 4. Verificar RLS
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .limit(1)
      
      if (error) {
        testes.push({
          nome: 'RLS (Row Level Security)',
          status: 'erro',
          mensagem: `Erro de permissão: ${error.message}`
        })
      } else {
        testes.push({
          nome: 'RLS (Row Level Security)',
          status: 'ok',
          mensagem: 'Permissões OK'
        })
      }
    } catch (error: any) {
      testes.push({
        nome: 'RLS (Row Level Security)',
        status: 'erro',
        mensagem: error.message
      })
    }

    // 5. Testar query completa do histórico
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id)
        .order('data_venda', { ascending: false })
      
      if (error) {
        testes.push({
          nome: 'Query Histórico Completo',
          status: 'erro',
          mensagem: error.message
        })
      } else {
        testes.push({
          nome: 'Query Histórico Completo',
          status: data.length > 0 ? 'ok' : 'aviso',
          mensagem: `Query OK - ${data.length} vendas retornadas`,
          detalhes: data
        })
      }
    } catch (error: any) {
      testes.push({
        nome: 'Query Histórico Completo',
        status: 'erro',
        mensagem: error.message
      })
    }

    setResultados(testes)
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Diagnóstico: Sistema de Vendas
      </h1>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="text-sm text-blue-700">
          <strong>Este diagnóstico verifica:</strong> Se as tabelas de vendas existem, 
          se há vendas registradas, e se as permissões estão corretas.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-3 text-gray-600">Executando diagnóstico...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {resultados.map((resultado, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                resultado.status === 'ok'
                  ? 'border-green-500'
                  : resultado.status === 'aviso'
                  ? 'border-yellow-500'
                  : 'border-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {resultado.status === 'ok' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : resultado.status === 'aviso' ? (
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {resultado.nome}
                  </h3>
                  <p className="text-gray-600 mb-2">{resultado.mensagem}</p>
                  
                  {resultado.detalhes && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Ver detalhes
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(resultado.detalhes, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && resultados.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recomendações</h2>
          
          {resultados.some(r => r.status === 'erro') && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-sm text-red-700">
                <strong>❌ Problemas encontrados!</strong><br />
                As tabelas de vendas não existem ou não estão acessíveis.<br />
                <br />
                <strong>Solução:</strong> Execute o SQL <code>SQL_FINAL_CORRIGIDO.sql</code> no Supabase.
              </p>
            </div>
          )}

          {resultados.some(r => r.nome === 'Vendas do Usuário' && r.status === 'aviso') && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-700">
                <strong>⚠️ Nenhuma venda registrada</strong><br />
                As tabelas existem, mas você ainda não registrou nenhuma venda.<br />
                <br />
                <strong>Ação:</strong> Vá em "Vendas" e registre uma venda para testar.
              </p>
            </div>
          )}

          {resultados.every(r => r.status === 'ok') && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700">
                <strong>✅ Tudo funcionando!</strong><br />
                O sistema de vendas está configurado corretamente e há vendas registradas.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button
          onClick={executarDiagnostico}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
              Executando...
            </>
          ) : (
            'Executar Novamente'
          )}
        </button>
        <a
          href="/vendas/historico"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors inline-block"
        >
          Ver Histórico de Vendas
        </a>
      </div>
    </div>
  )
}

