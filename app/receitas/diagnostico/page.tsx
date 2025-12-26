'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function DiagnosticoReceitasPage() {
  const { user } = useAuth()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runTests = async () => {
    setTesting(true)
    const testResults: any[] = []

    // Teste 1: Verificar se a tabela receitas existe
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .limit(1)

      testResults.push({
        test: 'Tabela "receitas" existe',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Tabela encontrada',
        details: error?.hint
      })
    } catch (error: any) {
      testResults.push({
        test: 'Tabela "receitas" existe',
        status: 'error',
        message: error.message
      })
    }

    // Teste 2: Verificar campos da tabela
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('id, user_id, nome, foto_url, descricao, rendimento_porcoes, tempo_preparo_minutos, margem_lucro_desejada, custo_total, preco_venda')
        .limit(1)

      testResults.push({
        test: 'Campos da tabela (foto_url, descricao, etc)',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Todos os campos existem',
        details: error ? 'Execute o SQL: SQL_ATUALIZAR_RECEITAS_COM_FOTO.sql' : null
      })
    } catch (error: any) {
      testResults.push({
        test: 'Campos da tabela',
        status: 'error',
        message: error.message,
        details: 'Execute o SQL: SQL_ATUALIZAR_RECEITAS_COM_FOTO.sql'
      })
    }

    // Teste 3: Verificar tabela itens_receita
    try {
      const { data, error } = await supabase
        .from('itens_receita')
        .select('*')
        .limit(1)

      testResults.push({
        test: 'Tabela "itens_receita" existe',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Tabela encontrada'
      })
    } catch (error: any) {
      testResults.push({
        test: 'Tabela "itens_receita" existe',
        status: 'error',
        message: error.message
      })
    }

    // Teste 4: Verificar se há ingredientes cadastrados
    try {
      const { data, error, count } = await supabase
        .from('ingredientes')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id || '')

      testResults.push({
        test: 'Ingredientes cadastrados',
        status: (count || 0) > 0 ? 'success' : 'warning',
        message: `${count || 0} ingrediente(s) encontrado(s)`,
        details: (count || 0) === 0 ? 'Cadastre ingredientes antes de criar receitas' : null
      })
    } catch (error: any) {
      testResults.push({
        test: 'Ingredientes cadastrados',
        status: 'error',
        message: error.message
      })
    }

    // Teste 5: Tentar inserir uma receita de teste
    if (user) {
      try {
        const testData = {
          user_id: user.id,
          nome: 'Teste de Receita',
          descricao: 'Teste',
          foto_url: null,
          rendimento_porcoes: 1,
          tempo_preparo_minutos: 30,
          margem_lucro_desejada: 100,
          custo_total: 0,
          preco_venda: 0,
        }

        const { data, error } = await supabase
          .from('receitas')
          .insert(testData)
          .select()
          .single()

        if (error) throw error

        // Deletar a receita de teste
        if (data) {
          await supabase.from('receitas').delete().eq('id', data.id)
        }

        testResults.push({
          test: 'Inserir receita de teste',
          status: 'success',
          message: 'Receita de teste criada e removida com sucesso'
        })
      } catch (error: any) {
        testResults.push({
          test: 'Inserir receita de teste',
          status: 'error',
          message: error.message,
          details: error.hint || error.code
        })
      }
    }

    setResults(testResults)
    setTesting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Diagnóstico: Página de Receitas
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-600 mb-4">
          Este diagnóstico verifica se tudo está configurado corretamente para criar receitas.
        </p>

        <button
          onClick={runTests}
          disabled={testing}
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
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{result.test}</h3>
                  <p className="text-sm text-gray-700">{result.message}</p>
                  {result.details && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      💡 {result.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Resumo */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">📋 Próximos Passos:</h3>
            
            {results.some(r => r.status === 'error' && r.test.includes('Campos da tabela')) && (
              <div className="mb-4 p-4 bg-white rounded">
                <p className="font-semibold text-gray-900 mb-2">
                  ⚠️ Execute o SQL para adicionar os campos novos:
                </p>
                <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                  <li>Abra o Supabase (https://supabase.com)</li>
                  <li>Vá em <strong>SQL Editor</strong></li>
                  <li>Abra o arquivo <code>SQL_ATUALIZAR_RECEITAS_COM_FOTO.sql</code></li>
                  <li>Copie todo o conteúdo</li>
                  <li>Cole no SQL Editor</li>
                  <li>Clique em <strong>RUN</strong></li>
                  <li>Aguarde 30 segundos</li>
                  <li>Execute este diagnóstico novamente</li>
                </ol>
              </div>
            )}

            {results.some(r => r.status === 'warning' && r.test.includes('Ingredientes')) && (
              <div className="mb-4 p-4 bg-white rounded">
                <p className="font-semibold text-gray-900 mb-2">
                  📝 Cadastre ingredientes primeiro:
                </p>
                <p className="text-sm text-gray-700">
                  Vá na página <strong>Ingredientes</strong> e cadastre alguns ingredientes antes de criar receitas.
                </p>
              </div>
            )}

            {results.every(r => r.status === 'success') && (
              <div className="p-4 bg-green-100 rounded">
                <p className="font-semibold text-green-900 mb-2">
                  ✅ Tudo configurado corretamente!
                </p>
                <p className="text-sm text-green-800">
                  Você pode criar receitas normalmente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

