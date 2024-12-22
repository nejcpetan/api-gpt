import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const CHATS_DIR = path.join(process.cwd(), 'data/chats')

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(CHATS_DIR, `${params.id}.json`)
    await fs.unlink(filePath)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 })
  }
} 