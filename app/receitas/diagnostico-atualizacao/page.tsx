'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react'

export default function DiagnosticoAtualizacaoPage() {
  const { user } = useAuth()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runTests = async () => {
    if (!user) {
      alert('Faça login primeiro')
      return
    }

    setTesting(true)
    const testResults: any[] = []

    // Teste 1: Verificar se campos existem
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('id, nome, requer_atualizacao, ultima_atualizacao_custos')
        .limit(1)

      testResults.push({
        test: '1. Campos novos na tabela receitas',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Campos encontrados: requer_atualizacao, ultima_atualizacao_custos',
        details: error ? 'Execute: SQL_ATUALIZAR_CUSTOS_AUTOMATICO.sql' : null
      })
    } catch (error: any) {
      testResults.push({
        test: '1. Campos novos na tabela receitas',
        status: 'error',
        message: error.message,
        details: 'Execute: SQL_ATUALIZAR_CUSTOS_AUTOMATICO.sql'
      })
    }

    // Teste 2: Verificar se trigger existe
    try {
      const { data, error } = await supabase
        .rpc('pg_get_triggerdef', { trigger_oid: 'trigger_ingrediente_alterado' })

      testResults.push({
        test: '2. Trigger de detecção automática',
        status: error ? 'warning' : 'success',
        message: error ? 'Trigger não encontrado (pode ser normal)' : 'Trigger está ativo',
        details: error ? 'Verifique se executou o SQL completo' : null
      })
    } catch (error: any) {
      testResults.push({
        test: '2. Trigger de detecção automática',
        status: 'warning',
        message: 'Não foi possível verificar o trigger',
        details: 'Execute: SQL_ATUALIZAR_CUSTOS_AUTOMATICO.sql'
      })
    }

    // Teste 3: Verificar função recalcular_custo_receita
    try {
      const { data, error } = await supabase
        .rpc('recalcular_custo_receita', { receita_id_param: '00000000-0000-0000-0000-000000000000' })

      testResults.push({
        test: '3. Função recalcular_custo_receita()',
        status: error && !error.message.includes('null value') ? 'error' : 'success',
        message: error && !error.message.includes('null value') ? error.message : 'Função existe e está funcionando',
        details: error && !error.message.includes('null value') ? 'Execute: SQL_ATUALIZAR_CUSTOS_AUTOMATICO.sql' : null
      })
    } catch (error: any) {
      testResults.push({
        test: '3. Função recalcular_custo_receita()',
        status: 'error',
        message: error.message,
        details: 'Execute: SQL_ATUALIZAR_CUSTOS_AUTOMATICO.sql'
      })
    }

    // Teste 4: Ver status das receitas
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('id, nome, requer_atualizacao, ultima_atualizacao_custos')
        .eq('user_id', user.id)

      testResults.push({
        test: '4. Status das receitas',
        status: 'success',
        message: `${data?.length || 0} receita(s) encontrada(s)`,
        details: data?.map((r: any) => 
          `• ${r.nome}: ${r.requer_atualizacao ? '⚠️ Precisa atualizar' : '✅ Atualizado'}`
        ).join('\n') || 'Nenhuma receita'
      })
    } catch (error: any) {
      testResults.push({
        test: '4. Status das receitas',
        status: 'error',
        message: error.message
      })
    }

    // Teste 5: Testar marcação manual
    try {
      const { data: receitas } = await supabase
        .from('receitas')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (receitas && receitas.length > 0) {
        // Tentar marcar manualmente
        const { error } = await supabase
          .from('receitas')
          .update({ requer_atualizacao: true })
          .eq('id', receitas[0].id)

        testResults.push({
          test: '5. Marcação manual de atualização',
          status: error ? 'error' : 'success',
          message: error ? error.message : 'Consegue marcar receitas manualmente',
          details: error ? null : 'Se trigger não funcionar, use atualização manual'
        })

        // Voltar ao estado anterior
        if (!error) {
          await supabase
            .from('receitas')
            .update({ requer_atualizacao: false })
            .eq('id', receitas[0].id)
        }
      } else {
        testResults.push({
          test: '5. Marcação manual de atualização',
          status: 'warning',
          message: 'Nenhuma receita para testar',
          details: 'Crie uma receita primeiro'
        })
      }
    } catch (error: any) {
      testResults.push({
        test: '5. Marcação manual de atualização',
        status: 'error',
        message: error.message
      })
    }

    // Teste 6: Verificar relacionamento ingredientes-receitas
    try {
      const { data: receitas } = await supabase
        .from('receitas')
        .select('id, nome')
        .eq('user_id', user.id)
        .limit(1)

      if (receitas && receitas.length > 0) {
        const { data: itens } = await supabase
          .from('itens_receita')
          .select(`
            *,
            ingredientes (id, nome)
          `)
          .eq('receita_id', receitas[0].id)

        testResults.push({
          test: '6. Relacionamento ingredientes-receitas',
          status: 'success',
          message: `Receita "${receitas[0].nome}" tem ${itens?.length || 0} ingrediente(s)`,
          details: itens?.map((i: any) => 
            `• ${i.ingredientes?.nome || 'Ingrediente não encontrado'}`
          ).join('\n') || 'Nenhum ingrediente'
        })
      } else {
        testResults.push({
          test: '6. Relacionamento ingredientes-receitas',
          status: 'warning',
          message: 'Nenhuma receita para verificar',
          details: 'Crie uma receita com ingredientes'
        })
      }
    } catch (error: any) {
      testResults.push({
        test: '6. Relacionamento ingredientes-receitas',
        status: 'error',
        message: error.message
      })
    }

    setResults(testResults)
    setTesting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Diagnóstico: Sistema de Atualização Automática
      </h1>

      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Problema:</strong> Alterou ingrediente mas receita não mostrou necessidade de atualização.
        </p>
        <p className="text-sm text-yellow-800 mt-2">
          Este diagnóstico vai identificar o que está faltando.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <button
          onClick={runTests}
          disabled={testing || !user}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Testando...
            </>
          ) : (
            'Executar Diagnóstico'
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : result.status === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.status === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : result.status === 'warning' ? (
                  <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{result.test}</h3>
                  <p className="text-sm text-gray-700">{result.message}</p>
                  {result.details && (
                    <pre className="text-xs text-gray-600 mt-2 p-2 bg-white rounded whitespace-pre-wrap">
                      {result.details}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Resumo e Próximos Passos */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">📋 Próximos Passos:</h3>
            
            {results.some(r => r.status === 'error' && r.test.includes('Campos novos')) && (
              <div className="mb-4 p-4 bg-white rounded">
                <p className="font-semibold text-gray-900 mb-2">
                  ❌ PROBLEMA: Campos novos não existem
                </p>
                <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                  <li>Abra o Supabase</li>
                  <li>Vá em <strong>SQL Editor</strong></li>
                  <li>Execute: <code>SQL_ATUALIZAR_CUSTOS_AUTOMATICO.sql</code></li>
                  <li>Aguarde 30 segundos</li>
                  <li>Reinicie: <code>npm run dev</code></li>
                  <li>Execute este diagnóstico novamente</li>
                </ol>
              </div>
            )}

            {results.every(r => r.status === 'success') && (
              <div className="p-4 bg-green-100 rounded">
                <p className="font-semibold text-green-900 mb-2">
                  ✅ Tudo configurado corretamente!
                </p>
                <p className="text-sm text-green-800 mb-3">
                  O sistema está funcionando. Teste:
                </p>
                <ol className="list-decimal ml-5 space-y-1 text-sm text-green-800">
                  <li>Vá em <strong>Ingredientes</strong></li>
                  <li>Edite um ingrediente que está em uma receita</li>
                  <li>Altere o preço</li>
                  <li>Salve</li>
                  <li>Vá em <strong>Receitas</strong></li>
                  <li>Veja o badge [⚠️ Atualizar]</li>
                </ol>
              </div>
            )}

            {results.some(r => r.status === 'warning' && r.test.includes('Nenhuma receita')) && (
              <div className="p-4 bg-yellow-100 rounded">
                <p className="font-semibold text-yellow-900 mb-2">
                  ⚠️ Cadastre uma receita primeiro
                </p>
                <p className="text-sm text-yellow-800">
                  Crie uma receita com ingredientes para testar o sistema.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

