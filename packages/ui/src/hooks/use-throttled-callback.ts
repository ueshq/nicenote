import { useMemo } from 'react'

import { throttle } from '@nicenote/shared'

import { useUnmount } from './use-unmount'

interface ThrottleSettings {
  leading?: boolean
  trailing?: boolean
}

/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes
 * @param options The throttle options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  wait = 250,
  dependencies: React.DependencyList = [],
  options: ThrottleSettings = {}
): {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T>
  cancel: () => void
} {
  const handler = useMemo(
    () =>
      throttle<T>(fn, wait, {
        leading: options.leading ?? false,
        trailing: options.trailing ?? true,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  )

  useUnmount(() => {
    handler.cancel()
  })

  return handler
}
