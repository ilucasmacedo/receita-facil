'use client'

import { ReactNode, useState } from 'react'
import { Search, Filter, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

interface FiltroGenericoProps {
  children: ReactNode
  titulo?: string
  onLimpar?: () => void
  mostrarBotaoLimpar?: boolean
  className?: string
  inicialmenteAberto?: boolean
}

export function FiltroGenerico({
  children,
  titulo = 'Filtros',
  onLimpar,
  mostrarBotaoLimpar = true,
  className = '',
  inicialmenteAberto = false
}: FiltroGenericoProps) {
  const [aberto, setAberto] = useState(inicialmenteAberto)

  return (
    <div className={`bg-white rounded-lg shadow-md mb-6 ${className}`}>
      {/* Botão para abrir/fechar */}
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">{titulo}</h3>
        </div>
        <div className="flex items-center gap-2">
          {aberto && mostrarBotaoLimpar && onLimpar && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLimpar()
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          )}
          {aberto ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </div>
      </button>

      {/* Conteúdo do filtro (apenas quando aberto) */}
      {aberto && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}

// Componentes auxiliares reutilizáveis

interface InputFiltroProps {
  label: string
  type?: 'text' | 'number' | 'date'
  placeholder?: string
  value: string | number
  onChange: (value: string) => void
  icon?: ReactNode
  className?: string
}

export function InputFiltro({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  className = ''
}: InputFiltroProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            icon ? 'pl-10' : ''
          }`}
        />
      </div>
    </div>
  )
}

interface SelectFiltroProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

export function SelectFiltro({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = ''
}: SelectFiltroProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface RangeFiltroProps {
  label: string
  valueMin: string | number
  valueMax: string | number
  onChangeMin: (value: string) => void
  onChangeMax: (value: string) => void
  placeholderMin?: string
  placeholderMax?: string
  type?: 'number' | 'date'
  className?: string
}

export function RangeFiltro({
  label,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  placeholderMin = 'Mínimo',
  placeholderMax = 'Máximo',
  type = 'number',
  className = ''
}: RangeFiltroProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type={type}
          value={valueMin}
          onChange={(e) => onChangeMin(e.target.value)}
          placeholder={placeholderMin}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type={type}
          value={valueMax}
          onChange={(e) => onChangeMax(e.target.value)}
          placeholder={placeholderMax}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

interface PeriodoFiltroProps {
  dataInicio: string
  dataFim: string
  onChangeInicio: (value: string) => void
  onChangeFim: (value: string) => void
  onPresetChange?: (preset: string) => void
  className?: string
}

export function PeriodoFiltro({
  dataInicio,
  dataFim,
  onChangeInicio,
  onChangeFim,
  onPresetChange,
  className = ''
}: PeriodoFiltroProps) {
  const presets = [
    { value: '', label: 'Período Personalizado' },
    { value: 'hoje', label: 'Hoje' },
    { value: '7dias', label: 'Últimos 7 Dias' },
    { value: '30dias', label: 'Últimos 30 Dias' },
    { value: 'este_mes', label: 'Este Mês' },
    { value: 'mes_passado', label: 'Mês Passado' },
    { value: 'este_ano', label: 'Este Ano' },
  ]

  return (
    <div className={className}>
      {onPresetChange && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período Rápido
          </label>
          <select
            onChange={(e) => onPresetChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {presets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Início
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => onChangeInicio(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Fim
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dataFim}
              onChange={(e) => onChangeFim(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

