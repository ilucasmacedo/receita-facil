'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle, AlertCircle, Loader2, Play } from 'lucide-react'

export default function DiagnosticoVendasPage() {
  const { user } = useAuth()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<string[]>([])

  const addLog = (message: string) => {
    setResults(prev => [...prev, message])
  }

  const executarDiagnostico = async () => {
    if (!user) {
      addLog('❌ Usuário não está logado')
      return
    }

    setTesting(true)
    setResults([])
    addLog('🔍 INICIANDO DIAGNÓSTICO DO SISTEMA DE VENDAS\n')

    try {
      // 1. Verificar se as tabelas existem
      addLog('1️⃣ Verificando tabelas...')
      const tabelasNecessarias = ['vendas', 'itens_venda', 'historico_estoque']
      
      for (const tabela of tabelasNecessarias) {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1)
        
        if (error) {
          addLog(`   ❌ Tabela "${tabela}" NÃO existe ou tem erro: ${error.message}`)
        } else {
          addLog(`   ✅ Tabela "${tabela}" existe`)
        }
      }

      // 2. Verificar se a função existe
      addLog('\n2️⃣ Verificando função deduzir_estoque_venda...')
      const { data: funcoes, error: funcError } = await supabase
        .rpc('deduzir_estoque_venda', { venda_id_param: '00000000-0000-0000-0000-000000000000' })
        .then(() => ({ data: true, error: null }))
        .catch((err) => ({ data: null, error: err }))

      if (funcError && funcError.message.includes('function') && funcError.message.includes('does not exist')) {
        addLog('   ❌ Função deduzir_estoque_venda NÃO existe')
        addLog('   💡 Você precisa executar o SQL_SISTEMA_VENDAS.sql')
      } else {
        addLog('   ✅ Função deduzir_estoque_venda existe')
      }

      // 3. Verificar receitas com custo
      addLog('\n3️⃣ Verificando receitas...')
      const { data: receitas, error: receitasError } = await supabase
        .from('receitas')
        .select('id, nome, custo_total, preco_venda')
        .eq('user_id', user.id)

      if (receitasError) {
        addLog(`   ❌ Erro ao buscar receitas: ${receitasError.message}`)
      } else if (!receitas || receitas.length === 0) {
        addLog('   ⚠️ Nenhuma receita cadastrada')
      } else {
        addLog(`   ✅ ${receitas.length} receita(s) encontrada(s)`)
        receitas.forEach(r => {
          if (!r.custo_total || r.custo_total === 0) {
            addLog(`   ⚠️ "${r.nome}" não tem custo calculado (R$ ${r.custo_total || 0})`)
          } else {
            addLog(`   ✅ "${r.nome}" - Custo: R$ ${r.custo_total.toFixed(2)}`)
          }
        })
      }

      // 4. Verificar ingredientes no estoque
      addLog('\n4️⃣ Verificando estoque de ingredientes...')
      const { data: ingredientes, error: ingError } = await supabase
        .from('ingredientes')
        .select('id, nome, quantidade_total, unidade')
        .eq('user_id', user.id)

      if (ingError) {
        addLog(`   ❌ Erro ao buscar ingredientes: ${ingError.message}`)
      } else if (!ingredientes || ingredientes.length === 0) {
        addLog('   ⚠️ Nenhum ingrediente no estoque')
      } else {
        addLog(`   ✅ ${ingredientes.length} ingrediente(s) no estoque`)
        ingredientes.forEach(i => {
          addLog(`   📦 ${i.nome}: ${i.quantidade_total} ${i.unidade}`)
        })
      }

      // 5. Verificar vendas existentes
      addLog('\n5️⃣ Verificando vendas registradas...')
      const { data: vendas, error: vendasError } = await supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (vendasError) {
        addLog(`   ❌ Erro ao buscar vendas: ${vendasError.message}`)
      } else if (!vendas || vendas.length === 0) {
        addLog('   ⚠️ Nenhuma venda registrada ainda')
      } else {
        addLog(`   ✅ ${vendas.length} venda(s) encontrada(s)`)
        vendas.forEach(v => {
          addLog(`   💰 ${new Date(v.data_venda).toLocaleString('pt-BR')}: R$ ${v.valor_total.toFixed(2)} - Status: ${v.status}`)
        })
      }

      // 6. Verificar histórico de estoque
      addLog('\n6️⃣ Verificando histórico de movimentações...')
      const { data: historico, error: histError } = await supabase
        .from('historico_estoque')
        .select('*')
        .eq('user_id', user.id)
        .order('data_movimentacao', { ascending: false })
        .limit(5)

      if (histError) {
        addLog(`   ❌ Erro ao buscar histórico: ${histError.message}`)
      } else if (!historico || historico.length === 0) {
        addLog('   ⚠️ Nenhuma movimentação de estoque registrada')
      } else {
        addLog(`   ✅ ${historico.length} movimentação(ões) encontrada(s)`)
        historico.forEach(h => {
          addLog(`   📝 ${h.tipo_movimentacao}: ${h.quantidade} (${new Date(h.data_movimentacao).toLocaleString('pt-BR')})`)
        })
      }

      // 7. Testar inserção de venda
      addLog('\n7️⃣ Testando inserção de venda (teste)...')
      const estoqueAntes = [...(ingredientes || [])]
      
      if (receitas && receitas.length > 0 && receitas[0].custo_total && receitas[0].custo_total > 0) {
        const receitaTeste = receitas[0]
        
        addLog(`   🧪 Criando venda de teste: ${receitaTeste.nome}`)
        
        // Criar venda de teste
        const { data: vendaTeste, error: vendaTesteError } = await supabase
          .from('vendas')
          .insert({
            user_id: user.id,
            valor_total: 10,
            custo_total: 5,
            lucro_total: 5,
            cliente_nome: 'TESTE DIAGNÓSTICO',
            status: 'pendente', // Não concluída para não deduzir estoque
          })
          .select()
          .single()

        if (vendaTesteError) {
          addLog(`   ❌ Erro ao criar venda de teste: ${vendaTesteError.message}`)
        } else {
          addLog(`   ✅ Venda de teste criada (ID: ${vendaTeste.id})`)
          
          // Criar item da venda
          const { error: itemError } = await supabase
            .from('itens_venda')
            .insert({
              venda_id: vendaTeste.id,
              receita_id: receitaTeste.id,
              quantidade: 1,
              preco_unitario: 10,
              custo_unitario: 5,
              subtotal: 10,
              lucro: 5,
            })

          if (itemError) {
            addLog(`   ❌ Erro ao criar item de venda: ${itemError.message}`)
          } else {
            addLog(`   ✅ Item de venda criado`)
          }
          
          // Deletar venda de teste
          await supabase.from('vendas').delete().eq('id', vendaTeste.id)
          addLog(`   🗑️ Venda de teste removida`)
        }
      } else {
        addLog('   ⚠️ Não há receitas com custo para testar')
      }

      addLog('\n' + '='.repeat(50))
      addLog('\n📋 RESUMO:')
      addLog(`✅ Diagnóstico concluído!`)
      addLog(`💡 Veja os resultados acima para identificar problemas`)

    } catch (error: any) {
      addLog(`\n❌ ERRO GERAL: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          🔍 Diagnóstico do Sistema de Vendas
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Este diagnóstico verifica se todas as tabelas, funções e triggers do sistema de vendas estão configurados corretamente.
          </p>
          
          <button
            onClick={executarDiagnostico}
            disabled={testing}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors disabled:bg-gray-400"
          >
            {testing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Executando diagnóstico...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Executar Diagnóstico Completo
              </>
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap break-words overflow-x-auto">
            {results.join('\n')}
          </div>
        )}
      </div>
    </div>
  )
}

