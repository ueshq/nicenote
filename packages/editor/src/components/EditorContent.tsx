import type { Editor } from '@tiptap/react'
import { EditorContent } from '@tiptap/react'

interface NicenoteEditorContentProps {
  editor: Editor | null
  isSourceMode: boolean
  sourceValue: string
  onSourceChange: (nextValue: string) => void
  onSourceBlur: () => void
  ariaLabel?: string
  sourcePlaceholder?: string
}

export function NicenoteEditorContent({
  editor,
  isSourceMode,
  sourceValue,
  onSourceChange,
  onSourceBlur,
  ariaLabel = 'Note content',
  sourcePlaceholder = 'Enter Markdown content',
}: NicenoteEditorContentProps) {
  if (isSourceMode) {
    return (
      <textarea
        className="nn-editor-source"
        aria-label={ariaLabel}
        spellCheck={false}
        value={sourceValue}
        onChange={(event) => onSourceChange(event.target.value)}
        onBlur={onSourceBlur}
        placeholder={sourcePlaceholder}
      />
    )
  }

  return <EditorContent editor={editor} className="nn-editor-content" role="presentation" />
}
