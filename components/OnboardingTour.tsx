"use client"

import { useEffect, useState } from 'react'
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export default function OnboardingTour() {
  const [hasRun, setHasRun] = useState(true) // Default true para não rodar sempre

  useEffect(() => {
    // Checa se é a primeira vez
    const seenTour = localStorage.getItem('hasSeenOnboardingTour')
    if (seenTour) return

    setHasRun(false)

    const tour = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0,0,0,0.7)',
      stagePadding: 10,
      popoverClass: 'driverjs-theme',
      nextBtnText: 'Próximo →',
      prevBtnText: '← Voltar',
      doneBtnText: 'Começar! 🚀',
      onDestroyStarted: () => {
        localStorage.setItem('hasSeenOnboardingTour', 'true')
        tour.destroy()
      },
      steps: [
        {
          popover: {
            title: '🎉 Bem-vindo ao Receita Fácil!',
            description: 'Vamos te guiar para criar sua primeira receita em poucos passos. Leva apenas 2 minutos!'
          }
        },
        {
          element: '[data-tour="menu-dashboard"]',
          popover: {
            title: '📊 Seu Dashboard',
            description: 'Aqui você acompanha lucros, vendas e estoque em tempo real. Vamos começar configurando o básico!',
          }
        },
        {
          element: '[data-tour="menu-insumos"]',
          popover: {
            title: '🥚 Passo 1: Cadastre seus Insumos',
            description: 'Insumos são seus ingredientes básicos (farinha, açúcar, ovos...). Clique aqui para adicionar os primeiros.',
          }
        },
        {
          element: '[data-tour="botao-adicionar-insumo"]',
          popover: {
            title: '➕ Adicionar Insumo',
            description: 'Clique neste botão e preencha: nome do ingrediente, unidade (kg, L, g...) e preço por unidade.',
          }
        },
        {
          element: '[data-tour="menu-receitas"]',
          popover: {
            title: '🍰 Passo 2: Crie um Modelo de Receita',
            description: 'Aqui você cria seus produtos (bolo, cupcake, torta...). Clique para começar!',
          }
        },
        {
          element: '[data-tour="botao-nova-receita"]',
          popover: {
            title: '✨ Nova Receita',
            description: 'Dê um nome, adicione os insumos que cadastrou e defina a quantidade. O custo é calculado automaticamente!',
          }
        },
        {
          element: '[data-tour="menu-produtos"]',
          popover: {
            title: '📦 Passo 3: Produza seus Produtos',
            description: 'Transforme suas receitas em produtos prontos para venda. Registre quantas unidades você produziu!',
          }
        },
        {
          element: '[data-tour="menu-vendas"]',
          popover: {
            title: '💰 Passo 4: Registre suas Vendas',
            description: 'Adicione produtos ao carrinho e registre a venda. O estoque é atualizado e o lucro calculado automaticamente!',
          }
        },
        {
          element: '[data-tour="menu-dashboard"]',
          popover: {
            title: '🎂 Pronto! Você já sabe o básico',
            description: 'Explore o Dashboard para ver gráficos, lucros e alertas de estoque. Boas vendas! 💚'
          }
        },
      ]
    })

    // Delay para garantir que o DOM carregou
    const timer = setTimeout(() => {
      tour.drive()
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return null // Componente invisível
}

