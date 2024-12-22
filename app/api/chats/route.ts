import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CHATS_DIR = path.join(process.cwd(), 'data/chats')

// Simple GET to read chats
export async function GET() {
  try {
    await fs.mkdir(CHATS_DIR, { recursive: true })
    const files = await fs.readdir(CHATS_DIR)
    const jsonFiles = files.filter(f => f.endsWith('.json'))
    
    const chats = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await fs.readFile(path.join(CHATS_DIR, file), 'utf-8')
        return JSON.parse(content)
      })
    )
    
    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error loading chats:', error)
    return NextResponse.json([])
  }
}

// Simple POST to save chat
export async function POST(req: Request) {
  try {
    const chat = await req.json()
    await fs.mkdir(CHATS_DIR, { recursive: true })
    
    await fs.writeFile(
      path.join(CHATS_DIR, `${chat.id}.json`),
      JSON.stringify(chat, null, 2)
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving chat:', error)
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 })
  }
} 