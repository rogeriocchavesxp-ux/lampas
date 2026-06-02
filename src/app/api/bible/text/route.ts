import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  const body = await req.json() as { book?: string; passageRef?: string; version?: string }
  const { book, passageRef, version = 'ARA' } = body

  if (!book || !passageRef) {
    return Response.json({ error: 'Referência incompleta' }, { status: 400 })
  }

  const client = new Anthropic()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Transcreva o texto bíblico completo de ${book} ${passageRef} na versão ${version} em português do Brasil, versículo por versículo.

Responda APENAS com JSON válido no formato exato abaixo — sem markdown, sem explicação, apenas o JSON:
{"verses":[{"v":1,"t":"texto do versículo"},{"v":2,"t":"texto do versículo"}]}`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  try {
    const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const data = JSON.parse(clean) as { verses: { v: number; t: string }[] }
    return Response.json({ verses: data.verses, version })
  } catch {
    return Response.json({ error: 'Falha ao processar o texto bíblico' }, { status: 500 })
  }
}
