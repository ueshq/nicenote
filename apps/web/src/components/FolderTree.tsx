import { memo, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@nicenote/ui'

import { useCreateFolder, useDeleteFolder, useUpdateFolder } from '../hooks/useFolderMutations'
import { buildFolderTree, type FolderTreeNode, useFoldersQuery } from '../hooks/useFoldersQuery'
import { WEB_ICON_SM_CLASS } from '../lib/class-names'
import { useFolderStore } from '../store/useFolderStore'

interface FolderNodeProps {
  node: FolderTreeNode
  depth: number
  selectedFolderId: string | null
  expandedIds: Set<string>
  onSelect: (id: string | null) => void
  onToggleExpand: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onCreateChild: (parentId: string) => void
}

const FolderNode = memo(function FolderNode({
  node,
  depth,
  selectedFolderId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onRename,
  onDelete,
  onCreateChild,
}: FolderNodeProps) {
  const { t } = useTranslation()
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const isActive = selectedFolderId === node.id
  const isExpanded = expandedIds.has(node.id)
  const hasChildren = node.children.length > 0

  const handleRenameSubmit = useCallback(() => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== node.name) {
      onRename(node.id, trimmed)
    }
    setIsRenaming(false)
  }, [renameValue, node.id, node.name, onRename])

  const startRename = useCallback(() => {
    setRenameValue(node.name)
    setIsRenaming(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }, [node.name])

  return (
    <li>
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors ${
          isActive
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          className="shrink-0 rounded p-0.5 hover:bg-accent"
          onClick={() => hasChildren && onToggleExpand(node.id)}
          tabIndex={-1}
        >
          <ChevronRight
            className={`${WEB_ICON_SM_CLASS} transition-transform ${isExpanded ? 'rotate-90' : ''} ${
              !hasChildren ? 'invisible' : ''
            }`}
          />
        </button>

        {isExpanded ? (
          <FolderOpen className={`${WEB_ICON_SM_CLASS} shrink-0 text-primary/70`} />
        ) : (
          <Folder className={`${WEB_ICON_SM_CLASS} shrink-0 text-primary/70`} />
        )}

        {isRenaming ? (
          <input
            ref={inputRef}
            className="min-w-0 flex-1 rounded border border-primary bg-background px-1 py-0.5 text-sm outline-none"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') setIsRenaming(false)
            }}
            autoFocus
          />
        ) : (
          <button
            className="min-w-0 flex-1 cursor-pointer truncate text-left outline-none"
            onClick={() => onSelect(node.id)}
            onDoubleClick={startRename}
          >
            {node.name}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`shrink-0 rounded p-0.5 transition-opacity hover:bg-accent ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              tabIndex={-1}
            >
              <MoreHorizontal className={WEB_ICON_SM_CLASS} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent portal align="start" className="w-40 border border-border p-1">
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
              onSelect={startRename}
            >
              <Pencil className={WEB_ICON_SM_CLASS} />
              {t('folder.rename')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
              onSelect={() => onCreateChild(node.id)}
            >
              <FolderPlus className={WEB_ICON_SM_CLASS} />
              {t('folder.newSubfolder')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive"
              onSelect={() => onDelete(node.id)}
            >
              <Trash2 className={WEB_ICON_SM_CLASS} />
              {t('folder.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && hasChildren && (
        <ul>
          {node.children.map((child) => (
            <FolderNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onRename={onRename}
              onDelete={onDelete}
              onCreateChild={onCreateChild}
            />
          ))}
        </ul>
      )}
    </li>
  )
})

export function FolderTree() {
  const { t } = useTranslation()
  const { data: folders } = useFoldersQuery()
  const selectedFolderId = useFolderStore((s) => s.selectedFolderId)
  const expandedIds = useFolderStore((s) => s.expandedFolderIds)
  const selectFolder = useFolderStore((s) => s.selectFolder)
  const toggleExpand = useFolderStore((s) => s.toggleExpand)

  const createFolder = useCreateFolder()
  const updateFolder = useUpdateFolder()
  const deleteFolder = useDeleteFolder()

  const tree = folders ? buildFolderTree(folders) : []

  const handleRename = useCallback(
    (id: string, name: string) => {
      updateFolder.mutate({ id, input: { name } })
    },
    [updateFolder]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (selectedFolderId === id) selectFolder(null)
      deleteFolder.mutate(id)
    },
    [deleteFolder, selectedFolderId, selectFolder]
  )

  const handleCreateChild = useCallback(
    (parentId: string) => {
      createFolder.mutate({ name: t('folder.newFolderName'), parentId })
    },
    [createFolder, t]
  )

  const handleCreateRoot = useCallback(() => {
    createFolder.mutate({ name: t('folder.newFolderName') })
  }, [createFolder, t])

  if (!folders) return null

  return (
    <div className="border-b border-border pb-2">
      <div className="flex items-center justify-between px-4 py-1">
        <span className="text-xs font-medium tracking-wider text-muted-foreground/60 uppercase">
          {t('folder.title')}
        </span>
        <button
          onClick={handleCreateRoot}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={t('folder.newFolder')}
        >
          <FolderPlus className={WEB_ICON_SM_CLASS} />
        </button>
      </div>

      <ul className="space-y-0.5 px-2">
        {/* All Notes */}
        <li>
          <button
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors ${
              selectedFolderId === null
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            }`}
            onClick={() => selectFolder(null)}
          >
            <FileText className={`${WEB_ICON_SM_CLASS} shrink-0`} />
            {t('folder.allNotes')}
          </button>
        </li>

        {tree.map((node) => (
          <FolderNode
            key={node.id}
            node={node}
            depth={0}
            selectedFolderId={selectedFolderId}
            expandedIds={expandedIds}
            onSelect={selectFolder}
            onToggleExpand={toggleExpand}
            onRename={handleRename}
            onDelete={handleDelete}
            onCreateChild={handleCreateChild}
          />
        ))}
      </ul>
    </div>
  )
}
