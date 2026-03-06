import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function callGroq(
  systemPrompt: string,
  userMessage: string,
  json = false
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    ...(json && { response_format: { type: 'json_object' as const } }),
  })

  return completion.choices[0]?.message?.content ?? ''
}

export async function streamGroq(systemPrompt: string, userMessage: string) {
  return groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 3000,
    stream: true,
  })
}
