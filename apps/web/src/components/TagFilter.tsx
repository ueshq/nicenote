import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Tag } from 'lucide-react'

import { useTagsQuery } from '../hooks/useTagsQuery'
import { WEB_ICON_SM_CLASS } from '../lib/class-names'
import { useTagFilterStore } from '../store/useTagFilterStore'

export const TagFilter = memo(function TagFilter() {
  const { t } = useTranslation()
  const { data: tags = [] } = useTagsQuery()
  const selectedTagId = useTagFilterStore((s) => s.selectedTagId)
  const selectTag = useTagFilterStore((s) => s.selectTag)

  const handleClick = useCallback(
    (tagId: string) => {
      selectTag(selectedTagId === tagId ? null : tagId)
    },
    [selectedTagId, selectTag]
  )

  if (tags.length === 0) return null

  return (
    <div className="px-3 py-2">
      <div className="mb-1.5 flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
        <Tag className={WEB_ICON_SM_CLASS} />
        {t('tag.title')}
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleClick(tag.id)}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
              selectedTagId === tag.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-accent'
            }`}
            style={
              tag.color && selectedTagId !== tag.id
                ? { backgroundColor: tag.color + '20', color: tag.color }
                : undefined
            }
          >
            {tag.color && selectedTagId !== tag.id && (
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
            )}
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  )
})
