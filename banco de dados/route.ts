// src/app/api/save-json/route.ts
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const json_data = await request.json()

    if (!json_data) {
      return NextResponse.json({ message: 'No JSON data provided' }, { status: 400 })
    }

    const collection = db.collection('saved_json')
    const result = await collection.insertOne(json_data)

    return NextResponse.json({ message: 'JSON saved successfully', id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Failed to save JSON:', error)
    return NextResponse.json({ message: 'Failed to save JSON' }, { status: 500 })
  }
}
