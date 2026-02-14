import { type PointerEvent, useCallback, useEffect, useRef, useState } from 'react'

const MIN_SIDEBAR_WIDTH = 260
const MAX_SIDEBAR_WIDTH = 560
const MOBILE_BREAKPOINT = 768

interface UseSidebarLayoutOptions {
  defaultSidebarWidth?: number
}

export function useSidebarLayout({ defaultSidebarWidth = 320 }: UseSidebarLayoutOptions = {}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth)
  const [isResizing, setIsResizing] = useState(false)
  const activePointerIdRef = useRef<number | null>(null)

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((previous) => !previous)
  }, [])

  const startResizing = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    activePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsResizing(true)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (!isResizing || !isSidebarOpen) return
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) {
        return
      }

      const nextWidth = event.clientX
      if (nextWidth < MIN_SIDEBAR_WIDTH || nextWidth > MAX_SIDEBAR_WIDTH) return
      setSidebarWidth(nextWidth)
    }

    const stopResizing = (event: globalThis.PointerEvent) => {
      if (activePointerIdRef.current !== null && event.pointerId !== activePointerIdRef.current) {
        return
      }

      activePointerIdRef.current = null
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', stopResizing)
      document.addEventListener('pointercancel', stopResizing)
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', stopResizing)
      document.removeEventListener('pointercancel', stopResizing)
      document.body.style.userSelect = ''
    }
  }, [isResizing, isSidebarOpen])

  return {
    isSidebarOpen,
    isMobile,
    sidebarWidth,
    isResizing,
    openSidebar,
    toggleSidebar,
    startResizing,
  }
}
