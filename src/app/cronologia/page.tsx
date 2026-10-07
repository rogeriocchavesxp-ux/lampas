import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cronologia Bíblica — Lampas',
  description: 'Linha do tempo interativa da história bíblica e do mundo antigo. Impérios, reis, profetas, personagens e eventos da Criação ao século I.',
}

export default function CronologiaPage() {
  return (
    <iframe
      src="/cronologia.html"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
      }}
      title="Cronologia Bíblica"
    />
  )
}
