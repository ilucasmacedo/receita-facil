'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, CheckCircle, Loader2, Play } from 'lucide-react'

export default function TesteTriggersPage() {
  const { user } = useAuth()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [ingredientes, setIngredientes] = useState<any[]>([])
  const [receitas, setReceitas] = useState<any[]>([])

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const loadData = async () => {
    if (!user) return

    addLog('📊 Carregando dados...')

    // Carregar ingredientes
    const { data: ings } = await supabase
      .from('ingredientes')
      .select('*')
      .eq('user_id', user.id)
    
    setIngredientes(ings || [])
    addLog(`✅ ${ings?.length || 0} ingredientes encontrados`)

    // Carregar receitas
    const { data: recs } = await supabase
      .from('receitas')
      .select(`
        *,
        itens_receita (
          *,
          ingredientes (nome)
        )
      `)
      .eq('user_id', user.id)
    
    setReceitas(recs || [])
    addLog(`✅ ${recs?.length || 0} receitas encontradas`)

    // Mostrar relacionamentos
    recs?.forEach(rec => {
      const itens = (rec as any).itens_receita || []
      if (itens.length > 0) {
        addLog(`   📝 Receita "${rec.nome}" usa: ${itens.map((i: any) => i.ingredientes?.nome).join(', ')}`)
      }
    })
  }

  const testarTrigger = async (ingredienteId: string, ingredienteNome: string) => {
    if (!user) return

    setTesting(true)
    setResults([])

    try {
      addLog(`🎯 INICIANDO TESTE COM: ${ingredienteNome}`)
      addLog('─────────────────────────────────')

      // 1. Ver estado inicial
      addLog('1️⃣ Verificando estado inicial das receitas...')
      const { data: receitasAntes } = await supabase
        .from('receitas')
        .select('id, nome, requer_atualizacao, custo_total')
        .eq('user_id', user.id)

      receitasAntes?.forEach(r => {
        addLog(`   • ${r.nome}: requer_atualizacao = ${r.requer_atualizacao ? '⚠️ TRUE' : '✅ FALSE'}, custo = R$ ${r.custo_total?.toFixed(2)}`)
      })

      // 2. Ver qual receita usa este ingrediente
      addLog('2️⃣ Verificando quais receitas usam este ingrediente...')
      const { data: receitasQueUsam } = await supabase
        .from('itens_receita')
        .select(`
          receita_id,
          receitas (id, nome)
        `)
        .eq('ingrediente_id', ingredienteId)

      if (!receitasQueUsam || receitasQueUsam.length === 0) {
        addLog('   ⚠️ NENHUMA RECEITA USA ESTE INGREDIENTE!')
        addLog('   💡 Crie uma receita que use este ingrediente primeiro.')
        setTesting(false)
        return
      }

      receitasQueUsam.forEach((r: any) => {
        addLog(`   ✅ Receita "${r.receitas.nome}" usa este ingrediente`)
      })

      // 3. Ver preço atual do ingrediente
      addLog('3️⃣ Buscando preço atual do ingrediente...')
      const { data: ingAtual } = await supabase
        .from('ingredientes')
        .select('preco_compra, quantidade_total')
        .eq('id', ingredienteId)
        .single()

      addLog(`   • Preço atual: R$ ${ingAtual?.preco_compra?.toFixed(2)}`)
      addLog(`   • Quantidade: ${ingAtual?.quantidade_total}`)

      // 4. ALTERAR O PREÇO (TRIGGER DEVE DISPARAR AQUI)
      const novoPreco = (ingAtual?.preco_compra || 0) + 1
      addLog(`4️⃣ ALTERANDO PREÇO: R$ ${ingAtual?.preco_compra?.toFixed(2)} → R$ ${novoPreco.toFixed(2)}`)
      
      const { error: updateError } = await supabase
        .from('ingredientes')
        .update({ preco_compra: novoPreco })
        .eq('id', ingredienteId)

      if (updateError) {
        addLog(`   ❌ ERRO ao alterar: ${updateError.message}`)
        setTesting(false)
        return
      }

      addLog('   ✅ Preço alterado no banco de dados')
      addLog('   ⏳ Aguardando trigger disparar...')

      // 5. Aguardar 2 segundos para trigger processar
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 6. VERIFICAR SE RECEITAS FORAM MARCADAS
      addLog('5️⃣ Verificando se receitas foram marcadas...')
      const { data: receitasDepois } = await supabase
        .from('receitas')
        .select('id, nome, requer_atualizacao, custo_total')
        .eq('user_id', user.id)

      let algumaMudou = false

      receitasDepois?.forEach(r => {
        const antes = receitasAntes?.find(ra => ra.id === r.id)
        const mudou = antes?.requer_atualizacao !== r.requer_atualizacao

        if (mudou) {
          algumaMudou = true
          addLog(`   ✅ "${r.nome}": ${antes?.requer_atualizacao ? 'TRUE' : 'FALSE'} → ${r.requer_atualizacao ? '⚠️ TRUE' : 'FALSE'} (MUDOU!)`)
        } else {
          addLog(`   • "${r.nome}": ${r.requer_atualizacao ? '⚠️ TRUE' : '✅ FALSE'} (não mudou)`)
        }
      })

      addLog('─────────────────────────────────')

      if (algumaMudou) {
        addLog('✅ TRIGGER FUNCIONOU! Receitas foram marcadas.')
      } else {
        addLog('❌ TRIGGER NÃO FUNCIONOU! Receitas não foram marcadas.')
        addLog('')
        addLog('🔧 POSSÍVEIS CAUSAS:')
        addLog('1. Trigger não foi criado corretamente')
        addLog('2. Trigger está desativado')
        addLog('3. Condição WHEN do trigger não foi satisfeita')
        addLog('')
        addLog('💡 SOLUÇÃO: Execute este SQL no Supabase:')
        addLog('')
        addLog('DROP TRIGGER IF EXISTS trigger_ingrediente_alterado ON ingredientes;')
        addLog('CREATE TRIGGER trigger_ingrediente_alterado')
        addLog('  AFTER UPDATE OF preco_compra')
        addLog('  ON ingredientes')
        addLog('  FOR EACH ROW')
        addLog('  EXECUTE FUNCTION marcar_receitas_para_atualizacao();')
      }

      // 7. Voltar o preço ao original
      addLog('6️⃣ Restaurando preço original...')
      await supabase
        .from('ingredientes')
        .update({ preco_compra: ingAtual?.preco_compra })
        .eq('id', ingredienteId)

      addLog('✅ Preço restaurado')

    } catch (error: any) {
      addLog(`❌ ERRO: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Teste Real: Trigger de Atualização
      </h1>

      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-yellow-800">
          <strong>🎯 Este teste simula uma edição REAL de ingrediente</strong>
        </p>
        <p className="text-sm text-yellow-800 mt-2">
          Vai alterar o preço de um ingrediente e verificar se o trigger marca as receitas como desatualizadas.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <button
          onClick={loadData}
          disabled={testing || !user}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 mb-4"
        >
          Carregar Ingredientes e Receitas
        </button>

        {ingredientes.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800 mb-2">Escolha um ingrediente para testar:</h3>
            {ingredientes.map(ing => (
              <button
                key={ing.id}
                onClick={() => testarTrigger(ing.id, ing.nome)}
                disabled={testing}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{ing.nome}</span>
                  <span className="text-sm text-gray-600">
                    R$ {ing.preco_compra?.toFixed(2)} | {ing.quantidade_total} {ing.unidade}
                  </span>
                </div>
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <span className="text-xs text-blue-600">Testar →</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm">
          <div className="space-y-1">
            {results.map((result, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {receitas.length === 0 && ingredientes.length > 0 && !testing && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>⚠️ Você não tem receitas cadastradas!</strong>
          </p>
          <p className="text-sm text-orange-800 mt-2">
            Crie uma receita que use um dos ingredientes acima para testar o trigger.
          </p>
        </div>
      )}
    </div>
  )
}

