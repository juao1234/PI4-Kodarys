'use client'

import { useState } from 'react'
import { ResizablePanelLayout } from '@/components/resizable-panel-layout'

export default function HomePage() {
  const [apiResponse, setApiResponse] = useState('')

  const handleSaveJson = async () => {
    setApiResponse('Salvando...')
    const jsonData = {
      name: 'Meu Desafio de Exemplo',
      language: 'TypeScript',
      difficulty: 'Hard',
      tags: ['array', 'string', 'typescript'],
    }

    try {
      const response = await fetch('/api/save-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      })

      const result = await response.json()

      if (response.ok) {
        setApiResponse(`JSON salvo com sucesso! ID: ${result.id}`)
      } else {
        setApiResponse(`Falha ao salvar o JSON: ${result.message}`)
      }
    } catch (error) {
      console.error('Erro ao chamar a API:', error)
      setApiResponse('Ocorreu um erro ao se comunicar com a API.')
    }
  }

  return (
    <main className="h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 text-amber-100 font-mono overflow-hidden">
      {/* Botão para salvar JSON */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleSaveJson}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded"
        >
          Salvar JSON de Exemplo
        </button>
        {apiResponse && <p className="mt-2 text-sm text-white">{apiResponse}</p>}
      </div>

      <ResizablePanelLayout />
    </main>
  )
}
