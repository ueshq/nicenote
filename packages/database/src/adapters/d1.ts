import type { DatabaseAdapter, QueryResult } from '../adapter'

// TODO: Implement using Cloudflare D1 binding.
// This adapter wraps the D1Database binding for use in Cloudflare Workers.
//
// Usage:
//   const adapter = new D1Adapter(env.DB)

export class D1Adapter implements DatabaseAdapter {
  // TODO: Accept D1Database instance in constructor
  // private db: D1Database

  async execute(_sql: string, _params?: unknown[]): Promise<QueryResult> {
    // TODO: Implement using this.db.prepare(sql).bind(...params).all()
    throw new Error('D1Adapter.execute() not yet implemented')
  }

  async executeBatch(_statements: { sql: string; params?: unknown[] }[]): Promise<void> {
    // TODO: Implement using this.db.batch(statements)
    throw new Error('D1Adapter.executeBatch() not yet implemented')
  }

  async close(): Promise<void> {
    // D1 connections are managed by the Workers runtime; nothing to close.
  }
}
