"use client"

import { useState, useRef, useEffect } from "react"
import { FileSystemItem } from "@/types/folder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Folder,
  File,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Copy,
} from "lucide-react"

interface FileSystemItemProps {
  item: FileSystemItem
  level?: number
  onToggleExpanded: (id: string) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onAddItem: (parentId: string, type: "file" | "folder", name: string) => void
  onItemClick: (itemId: string) => void
  onItemDoubleClick: (itemId: string, itemName: string) => void
  showQuickAdd: string | null
  setShowQuickAdd: (id: string | null) => void
  renamingId: string | null
  setRenamingId: (id: string | null) => void
  renameValue: string
  setRenameValue: (value: string) => void
  clickTimeouts: Map<string, NodeJS.Timeout>
  setClickTimeouts: React.Dispatch<React.SetStateAction<Map<string, NodeJS.Timeout>>>
}

export function FileSystemItemComponent({
  item,
  level = 0,
  onToggleExpanded,
  onRename,
  onDelete,
  onDuplicate,
  onAddItem,
  onItemClick,
  onItemDoubleClick,
  showQuickAdd,
  setShowQuickAdd,
  renamingId,
  setRenamingId,
  renameValue,
  setRenameValue,
  clickTimeouts,
  setClickTimeouts,
}: FileSystemItemProps) {
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renamingId === item.id && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId, item.id])

  const handleItemClick = () => {
    if (clickTimeouts.has(item.id)) {
      // This is a double-click, clear the timeout and don't expand
      const timeout = clickTimeouts.get(item.id)!
      clearTimeout(timeout)
      setClickTimeouts((prev) => {
        const newMap = new Map(prev)
        newMap.delete(item.id)
        return newMap
      })
      return
    }

    // Set a timeout for single click
    const timeout = setTimeout(() => {
      onItemClick(item.id)
      setClickTimeouts((prev) => {
        const newMap = new Map(prev)
        newMap.delete(item.id)
        return newMap
      })
    }, 200) // 200ms delay to detect double-click

    setClickTimeouts((prev) => {
      const newMap = new Map(prev)
      newMap.set(item.id, timeout)
      return newMap
    })
  }

  const handleItemDoubleClick = () => {
    // Clear any pending single-click timeout
    if (clickTimeouts.has(item.id)) {
      const timeout = clickTimeouts.get(item.id)!
      clearTimeout(timeout)
      setClickTimeouts((prev) => {
        const newMap = new Map(prev)
        newMap.delete(item.id)
        return newMap
      })
    }

    // Handle rename
    setRenamingId(item.id)
    setRenameValue(item.name)
  }

  const handleRename = () => {
    onRename(item.id, renameValue)
    setRenamingId(null)
  }

  const quickAddItem = (type: "file" | "folder") => {
    const input = document.querySelector(`input[placeholder="Enter name..."]`) as HTMLInputElement
    if (input?.value) {
      onAddItem(item.id, type, input.value)
      setShowQuickAdd(null)
    }
  }

  return (
    <div className="relative">
      <div
        className="group flex items-center gap-2.5 px-3 py-2 hover:bg-accent/40 rounded-lg transition-all duration-150 min-h-[40px] cursor-pointer"
        style={{ paddingLeft: `${Math.min(level * 20, 60) + 12}px` }}
        onClick={() => {
          if (item.type === "folder") {
            handleItemClick()
          }
        }}
        onDoubleClick={() => handleItemDoubleClick()}
      >
        {item.type === "folder" && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpanded(item.id)
            }}
            className="p-0.5 hover:bg-accent/60 rounded transition-colors"
          >
            {item.expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        )}
        {item.type === "file" && <div className="w-4" />}

        {item.type === "folder" ? (
          item.expanded ? (
            <FolderOpen className="w-4 h-4 text-blue-500/80 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-blue-500/80 flex-shrink-0" />
          )
        ) : (
          <File className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
        )}

        {renamingId === item.id ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename()
              if (e.key === "Escape") setRenamingId(null)
            }}
            className="h-7 text-sm flex-1 min-w-0 rounded-md border-0 bg-muted/30 px-2 py-1 focus:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-border"
          />
        ) : (
          <span className="flex-1 text-sm truncate cursor-pointer min-w-0 py-0.5 text-foreground/90">
            {item.name}
          </span>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {item.type === "folder" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowQuickAdd(showQuickAdd === item.id ? null : item.id)
              }}
              className="p-1 hover:bg-blue-500/10 rounded transition-colors"
              title="Add to this folder"
            >
              <Plus className="w-3.5 h-3.5 text-blue-500/70" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(item.id)
            }}
            className="p-1 hover:bg-green-500/10 rounded transition-colors"
            title="Duplicate item"
          >
            <Copy className="w-3.5 h-3.5 text-green-500/70" />
          </button>
          {item.id !== "root" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
              className="p-1 hover:bg-red-500/10 rounded transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500/70" />
            </button>
          )}
        </div>
      </div>

      {showQuickAdd === item.id && (
        <div
          className="content-area p-3 rounded-lg mx-3 mb-2"
          style={{ marginLeft: `${Math.min(level * 20, 60) + 36}px` }}
        >
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Input
              autoFocus
              placeholder="Enter name..."
              className="h-8 text-sm flex-1 border-border/50 bg-background/50 focus:bg-background"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  const target = e.target as HTMLInputElement
                  if (target.value) onAddItem(item.id, "folder", target.value)
                }
                if (e.key === "Escape") setShowQuickAdd(null)
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 flex-1 sm:flex-none text-xs"
                onClick={() => quickAddItem("folder")}
              >
                <Folder className="w-3 h-3 mr-1.5" />
                Folder
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 sm:flex-none text-xs bg-transparent border-border/50"
                onClick={() => quickAddItem("file")}
              >
                <File className="w-3 h-3 mr-1.5" />
                File
              </Button>
            </div>
          </div>
        </div>
      )}

      {item.type === "folder" && item.expanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FileSystemItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              onToggleExpanded={onToggleExpanded}
              onRename={onRename}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onAddItem={onAddItem}
              onItemClick={onItemClick}
              onItemDoubleClick={onItemDoubleClick}
              showQuickAdd={showQuickAdd}
              setShowQuickAdd={setShowQuickAdd}
              renamingId={renamingId}
              setRenamingId={setRenamingId}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              clickTimeouts={clickTimeouts}
              setClickTimeouts={setClickTimeouts}
            />
          ))}
        </div>
      )}
    </div>
  )
}
