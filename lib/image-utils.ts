// Utilitários para processar e fazer upload de imagens

/**
 * Redimensiona e faz crop de imagem para quadrado
 * @param file Arquivo de imagem original
 * @param size Tamanho do lado do quadrado (padrão: 400px)
 * @param quality Qualidade JPEG (0-1, padrão: 0.8)
 * @returns Blob da imagem processada
 */
export async function processarImagem(
  file: File,
  size: number = 400,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Criar canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'))
          return
        }
        
        // Definir tamanho do canvas (quadrado)
        canvas.width = size
        canvas.height = size
        
        // Calcular dimensões para crop central
        const sourceSize = Math.min(img.width, img.height)
        const sourceX = (img.width - sourceSize) / 2
        const sourceY = (img.height - sourceSize) / 2
        
        // Desenhar imagem com crop central
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize, // source (crop central)
          0, 0, size, size // destino (canvas)
        )
        
        // Converter para Blob (JPEG)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Não foi possível converter imagem'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('Não foi possível carregar a imagem'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Não foi possível ler o arquivo'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Valida se o arquivo é uma imagem válida
 * @param file Arquivo a ser validado
 * @param maxSizeMB Tamanho máximo em MB (padrão: 5MB)
 * @returns true se válido, mensagem de erro se inválido
 */
export function validarImagem(
  file: File,
  maxSizeMB: number = 5
): { valido: boolean; erro?: string } {
  // Validar tipo
  const tiposValidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!tiposValidos.includes(file.type)) {
    return {
      valido: false,
      erro: 'Formato inválido. Use JPG, PNG ou WebP.'
    }
  }
  
  // Validar tamanho
  const maxSize = maxSizeMB * 1024 * 1024 // Converter para bytes
  if (file.size > maxSize) {
    return {
      valido: false,
      erro: `Arquivo muito grande. Máximo: ${maxSizeMB}MB.`
    }
  }
  
  return { valido: true }
}

/**
 * Gera nome único para arquivo
 * @param userId ID do usuário
 * @param receitaId ID da receita (opcional)
 * @returns Nome do arquivo
 */
export function gerarNomeArquivo(userId: string, receitaId?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  
  if (receitaId) {
    return `${userId}/${receitaId}_${timestamp}.jpg`
  }
  
  return `${userId}/temp_${timestamp}_${random}.jpg`
}

/**
 * Cria URL de preview a partir de um File
 * @param file Arquivo de imagem
 * @returns URL de preview
 */
export function criarPreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Libera URL de preview da memória
 * @param url URL de preview
 */
export function liberarPreview(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * Formata tamanho de arquivo para exibição
 * @param bytes Tamanho em bytes
 * @returns String formatada (ex: "2.5 MB")
 */
export function formatarTamanho(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

