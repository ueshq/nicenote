// TODO: Embed SQL migration strings for in-app execution.
// These migrations will be run by the DatabaseAdapter on first launch
// and on subsequent app updates that include schema changes.
//
// Example structure:
//   export const migrations = [
//     { version: 1, sql: 'CREATE TABLE IF NOT EXISTS ...' },
//     { version: 2, sql: 'ALTER TABLE ...' },
//   ]

export interface Migration {
  version: number
  sql: string
}

export const migrations: Migration[] = [
  // TODO: Add initial migration that creates folders, notes, tags, note_tags tables
]
