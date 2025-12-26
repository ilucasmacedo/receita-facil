'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { 
  processarImagem, 
  validarImagem, 
  gerarNomeArquivo,
  criarPreview,
  liberarPreview,
  formatarTamanho
} from '@/lib/image-utils'

interface UploadFotoProps {
  userId: string
  receitaId?: string
  fotoAtual?: string
  onUploadSuccess: (url: string) => void
  onRemove?: () => void
  className?: string
}

export default function UploadFoto({
  userId,
  receitaId,
  fotoAtual,
  onUploadSuccess,
  onRemove,
  className = ''
}: UploadFotoProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(fotoAtual || null)
  const [progresso, setProgresso] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar arquivo
    const validacao = validarImagem(file, 5)
    if (!validacao.valido) {
      alert(validacao.erro)
      return
    }

    try {
      setUploading(true)
      setProgresso(20)

      // Criar preview temporário
      const previewUrl = criarPreview(file)
      setPreview(previewUrl)
      setProgresso(40)

      // Processar imagem (redimensionar e crop)
      const imagemProcessada = await processarImagem(file, 400, 0.8)
      setProgresso(60)

      // Gerar nome do arquivo
      const nomeArquivo = gerarNomeArquivo(userId, receitaId)
      setProgresso(70)

      // Fazer upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('receitas-fotos')
        .upload(nomeArquivo, imagemProcessada, {
          contentType: 'image/jpeg',
          upsert: true // Sobrescrever se já existir
        })

      if (error) {
        // Erro específico se bucket não existe
        if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
          throw new Error('❌ Bucket não encontrado!\n\n📋 Você precisa criar o bucket "receitas-fotos" no Supabase Storage primeiro.\n\n✅ Veja o arquivo CRIAR_BUCKET_URGENTE.md')
        }
        throw error
      }

      setProgresso(90)

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('receitas-fotos')
        .getPublicUrl(nomeArquivo)

      setProgresso(100)

      // Chamar callback de sucesso
      onUploadSuccess(urlData.publicUrl)

      // Liberar preview antigo
      if (previewUrl !== fotoAtual) {
        liberarPreview(previewUrl)
      }

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      alert(`Erro ao fazer upload: ${error.message}`)
      setPreview(fotoAtual || null)
    } finally {
      setUploading(false)
      setProgresso(0)
      // Limpar input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    if (preview && preview !== fotoAtual) {
      liberarPreview(preview)
    }
    setPreview(null)
    if (onRemove) {
      onRemove()
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Preview da foto - COMPACTO */}
      <div className="relative w-full aspect-square max-w-[200px] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!uploading && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                title="Remover foto"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="h-12 w-12 mb-1" />
            <p className="text-xs">Sem foto</p>
          </div>
        )}

        {/* Overlay de upload */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin mb-1" />
            <p className="text-white text-xs font-medium">{progresso}%</p>
          </div>
        )}
      </div>

      {/* Botão de upload - COMPACTO */}
      <button
        onClick={handleClick}
        disabled={uploading}
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs">Processando...</span>
          </>
        ) : (
          <>
            <Upload className="h-3.5 w-3.5" />
            <span className="text-xs">{preview ? 'Trocar' : 'Adicionar'}</span>
          </>
        )}
      </button>

      {/* Informações - COMPACTO */}
      <div className="text-[10px] text-gray-500 text-center space-y-0.5">
        <p>JPG, PNG, WebP (máx 5MB)</p>
        <p>Será redimensionada para 400x400px</p>
      </div>
    </div>
  )
}

