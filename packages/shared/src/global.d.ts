/**
 * Web-standard APIs available in all target runtimes
 * (Node 18+, Cloudflare Workers, browsers)
 * but not included in TypeScript's ES2020 lib.
 */

declare function setTimeout(callback: () => void, ms?: number): number
declare function clearTimeout(id: number | undefined): void

declare class URL {
  constructor(input: string, base?: string | URL)
  readonly protocol: string
  readonly hostname: string
  readonly host: string
  readonly port: string
  readonly pathname: string
  readonly search: string
  readonly hash: string
  readonly href: string
  readonly origin: string
}

interface AbortSignal {
  readonly aborted: boolean
  addEventListener(type: string, listener: () => void): void
  removeEventListener(type: string, listener: () => void): void
}
