import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

export type Database = PostgresJsDatabase<typeof schema>

const globalForDb = globalThis as unknown as {
  __dbClient?: ReturnType<typeof postgres>
  __db?: Database
}

export function getDb(): Database {
  if (globalForDb.__db) return globalForDb.__db

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required to connect to the database.')
  }

  const client = globalForDb.__dbClient ?? postgres(connectionString, { max: 10 })
  globalForDb.__dbClient = client
  globalForDb.__db = drizzle(client, { schema })

  return globalForDb.__db
}

export async function closeDb(): Promise<void> {
  if (!globalForDb.__dbClient) return
  await globalForDb.__dbClient.end()
  globalForDb.__dbClient = undefined
  globalForDb.__db = undefined
}
