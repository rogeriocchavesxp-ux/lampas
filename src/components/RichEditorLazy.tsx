'use client'

import dynamic from 'next/dynamic'
import type React from 'react'

// Lazy load do RichEditor para evitar carregar Tiptap no bundle principal
const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false })

// Tipo exportado para evitar issues de tipo
export default RichEditor as typeof import('./RichEditor').default
