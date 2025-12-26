// Utilitários para filtros de data e período

export function calcularPeriodo(preset: string): { inicio: string; fim: string } {
  const hoje = new Date()
  const fim = hoje.toISOString().split('T')[0] // YYYY-MM-DD
  let inicio = fim

  switch (preset) {
    case 'hoje':
      inicio = fim
      break
    
    case '7dias':
      const seteDiasAtras = new Date(hoje)
      seteDiasAtras.setDate(hoje.getDate() - 7)
      inicio = seteDiasAtras.toISOString().split('T')[0]
      break
    
    case '30dias':
      const trintaDiasAtras = new Date(hoje)
      trintaDiasAtras.setDate(hoje.getDate() - 30)
      inicio = trintaDiasAtras.toISOString().split('T')[0]
      break
    
    case 'este_mes':
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      inicio = primeiroDiaMes.toISOString().split('T')[0]
      break
    
    case 'mes_passado':
      const primeiroDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
      const ultimoDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
      inicio = primeiroDiaMesPassado.toISOString().split('T')[0]
      return {
        inicio,
        fim: ultimoDiaMesPassado.toISOString().split('T')[0]
      }
    
    case 'este_ano':
      const primeiroDoAno = new Date(hoje.getFullYear(), 0, 1)
      inicio = primeiroDoAno.toISOString().split('T')[0]
      break
    
    default:
      // Padrão: último mês
      const umMesAtras = new Date(hoje)
      umMesAtras.setMonth(hoje.getMonth() - 1)
      inicio = umMesAtras.toISOString().split('T')[0]
  }

  return { inicio, fim }
}

// Normalizar nome para busca (remover acentos, lowercase, trim)
export function normalizarNome(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Formatar data para exibição (YYYY-MM-DD -> DD/MM/YYYY)
export function formatarData(data: string): string {
  if (!data) return ''
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// Parsear data de DD/MM/YYYY para YYYY-MM-DD
export function parsearData(data: string): string {
  if (!data) return ''
  const [dia, mes, ano] = data.split('/')
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
}

// Verificar se valor está em range
export function estaNoRange(
  valor: number,
  min: number | string | null,
  max: number | string | null
): boolean {
  const minNum = min ? Number(min) : -Infinity
  const maxNum = max ? Number(max) : Infinity
  return valor >= minNum && valor <= maxNum
}

