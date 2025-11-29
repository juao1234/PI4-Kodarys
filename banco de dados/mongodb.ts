import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME || 'Kodarys'

if (!MONGODB_URI) {
  throw new Error(
    'Definir MONGODB_URI em variáveis de ambiente no arquivo.env.local'
  )
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(MONGODB_URI as string)

  await client.connect()

  const db = client.db(DB_NAME)

  cachedClient = client
  cachedDb = db

  return { client, db }
}
