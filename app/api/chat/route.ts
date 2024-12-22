import OpenAI from 'openai'
import { AVAILABLE_MODELS } from '@/lib/constants'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages, fileId, model, apiKey } = await req.json()
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not set' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Debug logs
    console.log('Received model:', model)
    console.log('Available models:', AVAILABLE_MODELS.map(m => m.id))

    const validModel = AVAILABLE_MODELS.find(m => m.id === model)
    if (!validModel) {
      console.error('Invalid model:', model)
      console.error('Available models:', AVAILABLE_MODELS)
      throw new Error(`Invalid model specified: ${model}`)
    }

    console.log('Using model alias:', validModel.alias)

    const completion = await openai.chat.completions.create({
      model: validModel.alias,
      messages: [
        ...(fileId ? [{
          role: 'system',
          content: `Using the uploaded file with ID: ${fileId}`,
        }] : []),
        ...messages
      ],
      stream: true,
      temperature: 1,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
        } catch (error) {
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('OpenAI API Error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error processing your request' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 