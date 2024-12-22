import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create a new FormData instance for OpenAI
    const openAIFormData = new FormData()
    openAIFormData.append('purpose', 'assistants')
    openAIFormData.append('file', file)

    // Make direct request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openAIFormData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to upload file to OpenAI')
    }

    const data = await response.json()
    return NextResponse.json({ fileId: data.id })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error uploading file' },
      { status: 500 }
    )
  }
} 