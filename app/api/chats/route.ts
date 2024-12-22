import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

// Use absolute path from project root
const CHATS_DIR = path.join(process.cwd(), 'data', 'chats')

// More robust directory creation
async function ensureDir() {
  try {
    await fs.access(CHATS_DIR)
  } catch {
    // Create full directory path if it doesn't exist
    await fs.mkdir(CHATS_DIR, { recursive: true })
    console.log('Created chats directory:', CHATS_DIR)
  }
}

export async function GET() {
  try {
    await ensureDir()
    const files = await fs.readdir(CHATS_DIR)
    console.log('Found chat files:', files)
    
    const chats = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(path.join(CHATS_DIR, file), 'utf-8')
        return JSON.parse(content)
      })
    )
    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error loading chats:', error)
    return NextResponse.json({ error: 'Failed to load chats' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const chat = await req.json()
    await ensureDir()
    
    const filePath = path.join(CHATS_DIR, `${chat.id}.json`)
    await fs.writeFile(
      filePath,
      JSON.stringify(chat, null, 2)
    )
    console.log('Saved chat to:', filePath)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving chat:', error)
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 })
  }
} 