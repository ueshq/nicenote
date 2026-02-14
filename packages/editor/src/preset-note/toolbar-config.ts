import type { NoteCommandId } from '../core/commands'

export type NoteToolbarItemId = NoteCommandId | 'link' | 'sourceMode' | 'headingMenu' | 'listMenu'

export interface NoteToolbarItem {
  id: NoteToolbarItemId
  label: string
  shortcut?: string
}

export const HEADING_MENU_ITEMS: readonly NoteToolbarItem[] = [
  { id: 'heading1', label: '标题1', shortcut: 'Mod+Alt+1' },
  { id: 'heading2', label: '标题2', shortcut: 'Mod+Alt+2' },
  { id: 'heading3', label: '标题3', shortcut: 'Mod+Alt+3' },
]

export const LIST_MENU_ITEMS: readonly NoteToolbarItem[] = [
  { id: 'bulletList', label: '无序列表', shortcut: 'Mod+Shift+8' },
  { id: 'orderedList', label: '有序列表', shortcut: 'Mod+Shift+7' },
]

export const NOTE_TOOLBAR_GROUPS: readonly (readonly NoteToolbarItem[])[] = [
  [
    { id: 'undo', label: '撤销', shortcut: 'Mod+Z' },
    { id: 'redo', label: '重做', shortcut: 'Mod+Shift+Z' },
    { id: 'headingMenu', label: '标题' },
    { id: 'listMenu', label: '列表' },
  ],
  [
    { id: 'bold', label: '加粗', shortcut: 'Mod+B' },
    { id: 'italic', label: '斜体', shortcut: 'Mod+I' },
    { id: 'strike', label: '删除线' },
    { id: 'code', label: '行内代码' },
    { id: 'blockquote', label: '引用' },
  ],
  [{ id: 'link', label: '链接', shortcut: 'Mod+K' }],
  [{ id: 'sourceMode', label: '源码', shortcut: 'Mod+Shift+M' }],
]
