'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function DiagnosticoCalculoPage() {
  const { user } = useAuth()
  const [resultado, setResultado] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const executarDiagnostico = async () => {
    if (!user) {
      setResultado('❌ Usuário não está logado')
      return
    }

    setLoading(true)
    let log = '🔍 DIAGNÓSTICO DE CÁLCULO DE RECEITAS\n\n'

    try {
      // 1. Verificar receitas
      log += '1️⃣ Verificando receitas cadastradas...\n'
      const { data: receitas, error: receitasError } = await supabase
        .from('receitas')
        .select('id, nome, margem_lucro_desejada, custo_total, preco_venda')
        .eq('user_id', user.id)

      if (receitasError) {
        log += `❌ Erro ao buscar receitas: ${receitasError.message}\n`
      } else if (!receitas || receitas.length === 0) {
        log += '❌ Nenhuma receita encontrada\n'
      } else {
        log += `✅ ${receitas.length} receita(s) encontrada(s):\n`
        receitas.forEach(r => {
          log += `   - ${r.nome} (Margem: ${r.margem_lucro_desejada}%, Custo: R$ ${r.custo_total || 0}, Venda: R$ ${r.preco_venda || 0})\n`
        })

        // 2. Para cada receita, verificar ingredientes
        for (const receita of receitas) {
          log += `\n2️⃣ Ingredientes da receita "${receita.nome}":\n`
          
          const { data: itens, error: itensError } = await supabase
            .from('itens_receita')
            .select(`
              id,
              quantidade_usada,
              ingredientes (
                id,
                nome,
                preco_compra,
                quantidade_total,
                unidade,
                tipo_origem,
                quantidade_por_receita
              )
            `)
            .eq('receita_id', receita.id)

          if (itensError) {
            log += `❌ Erro ao buscar ingredientes: ${itensError.message}\n`
          } else if (!itens || itens.length === 0) {
            log += `⚠️ Nenhum ingrediente cadastrado nesta receita!\n`
          } else {
            log += `✅ ${itens.length} ingrediente(s):\n`
            itens.forEach((item: any) => {
              const ing = item.ingredientes
              const custoUnitario = ing.preco_compra / ing.quantidade_total
              const custoItem = custoUnitario * item.quantidade_usada
              log += `   - ${ing.nome}:\n`
              log += `     • Quantidade usada: ${item.quantidade_usada} ${ing.unidade}\n`
              log += `     • Preço compra: R$ ${ing.preco_compra}\n`
              log += `     • Quantidade total: ${ing.quantidade_total} ${ing.unidade}\n`
              log += `     • Custo unitário: R$ ${custoUnitario.toFixed(4)}\n`
              log += `     • Custo nesta receita: R$ ${custoItem.toFixed(2)}\n`
            })

            // Calcular custo total
            const custoTotal = itens.reduce((acc: number, item: any) => {
              const ing = item.ingredientes
              const custoUnitario = ing.preco_compra / ing.quantidade_total
              return acc + (custoUnitario * item.quantidade_usada)
            }, 0)

            const precoVenda = custoTotal * (1 + (receita.margem_lucro_desejada / 100))

            log += `\n📊 CÁLCULO ESPERADO:\n`
            log += `   • Custo Total: R$ ${custoTotal.toFixed(2)}\n`
            log += `   • Preço Venda (${receita.margem_lucro_desejada}%): R$ ${precoVenda.toFixed(2)}\n`
          }

          // 3. Testar a função SQL
          log += `\n3️⃣ Testando função SQL recalcular_custo_receita...\n`
          const { data: resultado, error: funcaoError } = await supabase
            .rpc('recalcular_custo_receita', {
              receita_id_param: receita.id
            })

          if (funcaoError) {
            log += `❌ Erro ao chamar função: ${funcaoError.message}\n`
          } else {
            log += `✅ Função executada com sucesso!\n`
            log += `   • Retorno: ${JSON.stringify(resultado, null, 2)}\n`
          }

          log += '\n' + '='.repeat(50) + '\n'
        }
      }

    } catch (error: any) {
      log += `\n❌ ERRO GERAL: ${error.message}\n`
    }

    setResultado(log)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🔍 Diagnóstico de Cálculo de Receitas
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={executarDiagnostico}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Executando...' : '▶️ Executar Diagnóstico'}
          </button>
        </div>

        {resultado && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
            {resultado}
          </div>
        )}
      </div>
    </div>
  )
}

