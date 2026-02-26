export interface QueryResult {
  rows: unknown[]
}

export interface DatabaseAdapter {
  execute(sql: string, params?: unknown[]): Promise<QueryResult>
  executeBatch(statements: { sql: string; params?: unknown[] }[]): Promise<void>
  close(): Promise<void>
}
