import type { DatabaseAdapter, QueryResult } from '../adapter'

// TODO: Implement using @op-engineering/op-sqlite
// This adapter wraps op-sqlite for use on React Native (iOS/Android).
//
// Usage:
//   import { open } from '@op-engineering/op-sqlite'
//   const db = open({ name: 'nicenote.db' })
//   const adapter = new OpSQLiteAdapter(db)

export class OpSQLiteAdapter implements DatabaseAdapter {
  // TODO: Accept op-sqlite DB instance in constructor
  // private db: OPSQLiteConnection

  async execute(_sql: string, _params?: unknown[]): Promise<QueryResult> {
    // TODO: Implement using this.db.execute(sql, params)
    throw new Error('OpSQLiteAdapter.execute() not yet implemented')
  }

  async executeBatch(_statements: { sql: string; params?: unknown[] }[]): Promise<void> {
    // TODO: Implement using this.db.executeBatch(statements)
    throw new Error('OpSQLiteAdapter.executeBatch() not yet implemented')
  }

  async close(): Promise<void> {
    // TODO: Implement using this.db.close()
    throw new Error('OpSQLiteAdapter.close() not yet implemented')
  }
}
