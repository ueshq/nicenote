import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Check, Languages, Moon, Settings, Sun } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { WEB_ICON_BUTTON_CLASS, WEB_ICON_MD_CLASS, WEB_ICON_SM_CLASS } from '../lib/class-names'
import { useLanguageStore } from '../store/useLanguageStore'
import { useThemeStore } from '../store/useThemeStore'

export function SettingsDropdown() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { theme, toggle: toggleTheme } = useThemeStore(
    useShallow((s) => ({
      theme: s.theme,
      toggle: s.toggle,
    }))
  )
  const { language, setLanguage } = useLanguageStore(
    useShallow((s) => ({
      language: s.language,
      setLanguage: s.setLanguage,
    }))
  )

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, handleClickOutside])

  const itemClass =
    'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none hover:bg-accent'

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Settings"
        aria-expanded={open}
        className={`${WEB_ICON_BUTTON_CLASS} focus-visible:ring-2 focus-visible:ring-primary`}
      >
        <Settings className={WEB_ICON_MD_CLASS} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-border bg-background p-1 shadow-md">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {t('settings.theme')}
          </div>
          <button
            className={itemClass}
            onClick={() => {
              if (theme === 'dark') toggleTheme()
              setOpen(false)
            }}
          >
            <Sun className={WEB_ICON_SM_CLASS} />
            <span className="flex-1 text-left">{t('settings.light')}</span>
            {theme === 'light' && <Check className={WEB_ICON_SM_CLASS} />}
          </button>
          <button
            className={itemClass}
            onClick={() => {
              if (theme === 'light') toggleTheme()
              setOpen(false)
            }}
          >
            <Moon className={WEB_ICON_SM_CLASS} />
            <span className="flex-1 text-left">{t('settings.dark')}</span>
            {theme === 'dark' && <Check className={WEB_ICON_SM_CLASS} />}
          </button>

          <div className="my-1 h-px bg-border" />

          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {t('settings.language')}
          </div>
          <button
            className={itemClass}
            onClick={() => {
              setLanguage('en')
              setOpen(false)
            }}
          >
            <Languages className={WEB_ICON_SM_CLASS} />
            <span className="flex-1 text-left">{t('settings.english')}</span>
            {language === 'en' && <Check className={WEB_ICON_SM_CLASS} />}
          </button>
          <button
            className={itemClass}
            onClick={() => {
              setLanguage('zh')
              setOpen(false)
            }}
          >
            <Languages className={WEB_ICON_SM_CLASS} />
            <span className="flex-1 text-left">{t('settings.chinese')}</span>
            {language === 'zh' && <Check className={WEB_ICON_SM_CLASS} />}
          </button>
        </div>
      )}
    </div>
  )
}
