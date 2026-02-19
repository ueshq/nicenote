import type { NoteCommandId } from '../core/commands'
import type { EditorToolbarLabels } from '../core/labels'

export type NoteToolbarItemId = NoteCommandId | 'link' | 'sourceMode' | 'headingMenu' | 'listMenu'

export interface NoteToolbarItem {
  id: NoteToolbarItemId
  labelKey: keyof EditorToolbarLabels
  shortcut?: string
}

export const HEADING_MENU_ITEMS: readonly NoteToolbarItem[] = [
  { id: 'heading1', labelKey: 'heading1', shortcut: 'Mod+Alt+1' },
  { id: 'heading2', labelKey: 'heading2', shortcut: 'Mod+Alt+2' },
  { id: 'heading3', labelKey: 'heading3', shortcut: 'Mod+Alt+3' },
]

export const LIST_MENU_ITEMS: readonly NoteToolbarItem[] = [
  { id: 'bulletList', labelKey: 'bulletList', shortcut: 'Mod+Shift+8' },
  { id: 'orderedList', labelKey: 'orderedList', shortcut: 'Mod+Shift+7' },
]

export const NOTE_TOOLBAR_GROUPS: readonly (readonly NoteToolbarItem[])[] = [
  [
    { id: 'undo', labelKey: 'undo', shortcut: 'Mod+Z' },
    { id: 'redo', labelKey: 'redo', shortcut: 'Mod+Shift+Z' },
    { id: 'headingMenu', labelKey: 'heading' },
    { id: 'listMenu', labelKey: 'list' },
  ],
  [
    { id: 'bold', labelKey: 'bold', shortcut: 'Mod+B' },
    { id: 'italic', labelKey: 'italic', shortcut: 'Mod+I' },
    { id: 'strike', labelKey: 'strike' },
    { id: 'code', labelKey: 'code' },
    { id: 'blockquote', labelKey: 'blockquote' },
  ],
  [{ id: 'link', labelKey: 'link', shortcut: 'Mod+K' }],
  [{ id: 'sourceMode', labelKey: 'sourceMode', shortcut: 'Mod+Shift+M' }],
]
