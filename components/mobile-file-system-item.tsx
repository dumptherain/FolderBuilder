"use client"

import type React from "react"

import { useState, useRef, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Folder,
  File,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Copy,
  MoreVertical,
  Edit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import type { FileSystemItem } from "@/types/folder"

interface MobileFileSystemItemProps {
  item: FileSystemItem
  level?: number
  onToggleExpanded: (id: string) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onAddItem: (parentId: string, type: "file" | "folder", name: string) => void
  onItemClick: (id: string) => void
  onItemDoubleClick: (id: string, name: string) => void
  showQuickAdd: string | null
  setShowQuickAdd: (id: string | null) => void
  renamingId: string | null
  setRenamingId: (id: string | null) => void
  renameValue: string
  setRenameValue: (value: string) => void
  clickTimeouts: Map<string, NodeJS.Timeout>
  setClickTimeouts: (timeouts: Map<string, NodeJS.Timeout>) => void
}

// Memoize the component to prevent unnecessary re-renders
export const MobileFileSystemItem = memo(function MobileFileSystemItem({
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
}: MobileFileSystemItemProps) {
  const device = useDeviceDetection()
  const renameInputRef = useRef<HTMLInputElement>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isLongPress, setIsLongPress] = useState(false)
  const [originalName, setOriginalName] = useState("")

  useEffect(() => {
    if (renamingId === item.id && renameInputRef.current) {
      // Store the original name when starting to rename
      setOriginalName(item.name)
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId, item.id, item.name])

  const handleTouchStart = () => {
    if (!device.hasTouch) return

    setIsLongPress(false)
    const timer = setTimeout(() => {
      setIsLongPress(true)
      // Haptic feedback if available
      if ("vibrate" in navigator) {
        navigator.vibrate(50)
      }
      onItemDoubleClick(item.id, item.name)
    }, 500)

    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }

    if (!isLongPress && item.type === "folder") {
      onItemClick(item.id)
    }
  }

  const handleClick = () => {
    if (device.hasTouch) return // Handle via touch events

    if (item.type === "folder") {
      if (clickTimeouts.has(item.id)) {
        // Double click
        const timeout = clickTimeouts.get(item.id)!
        clearTimeout(timeout)
        setClickTimeouts((prev) => {
          const newMap = new Map(prev)
          newMap.delete(item.id)
          return newMap
        })
        onItemDoubleClick(item.id, item.name)
        return
      }

      // Single click - set timeout
      const timeout = setTimeout(() => {
        onItemClick(item.id)
        setClickTimeouts((prev) => {
          const newMap = new Map(prev)
          newMap.delete(item.id)
          return newMap
        })
      }, 200)

      setClickTimeouts((prev) => {
        const newMap = new Map(prev)
        newMap.set(item.id, timeout)
        return newMap
      })
    }
  }

  const handleRename = (newName: string) => {
    if (newName.trim() && newName.trim() !== originalName) {
      onRename(item.id, newName.trim())
    }
    setRenamingId(null)
    setOriginalName("")
  }

  const handleCancelRename = () => {
    setRenamingId(null)
    setOriginalName("")
  }

  const handleRenameBlur = () => {
    // Only apply rename if the value has actually changed
    if (renameValue.trim() && renameValue.trim() !== originalName) {
      handleRename(renameValue)
    } else {
      handleCancelRename()
    }
  }

  const quickAddItem = (type: "file" | "folder", name: string) => {
    if (!name.trim()) return
    onAddItem(item.id, type, name.trim())
    setShowQuickAdd(null)
  }

  const handleQuickAddBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Use setTimeout to allow for button clicks to register first
    setTimeout(() => {
      // Check if the focus moved to a related element (like the buttons)
      const activeElement = document.activeElement
      const parentContainer = e.currentTarget.parentElement

      if (parentContainer && activeElement && !parentContainer.contains(activeElement)) {
        setShowQuickAdd(null)
      }
    }, 150)
  }

  const touchTargetSize = device.isMobile ? "min-h-[48px]" : "min-h-[40px]"
  const paddingLeft = Math.min(level * (device.isMobile ? 16 : 20), 60) + 12

  return (
    <div className="relative">
      <div
        className={cn(
          "group flex items-center gap-2.5 px-3 py-2 hover:bg-accent/40 rounded-lg transition-all duration-150 cursor-pointer",
          touchTargetSize,
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {item.type === "folder" && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpanded(item.id)
            }}
            className={cn("p-0.5 hover:bg-accent/60 rounded transition-colors", device.isMobile && "p-1")}
          >
            {item.expanded ? (
              <ChevronDown className={cn("text-muted-foreground", device.isMobile ? "w-4 h-4" : "w-3.5 h-3.5")} />
            ) : (
              <ChevronRight className={cn("text-muted-foreground", device.isMobile ? "w-4 h-4" : "w-3.5 h-3.5")} />
            )}
          </button>
        )}
        {item.type === "file" && <div className={device.isMobile ? "w-5" : "w-4"} />}

        {item.type === "folder" ? (
          item.expanded ? (
            <FolderOpen className={cn("text-blue-500/80 flex-shrink-0", device.isMobile ? "w-5 h-5" : "w-4 h-4")} />
          ) : (
            <Folder className={cn("text-blue-500/80 flex-shrink-0", device.isMobile ? "w-5 h-5" : "w-4 h-4")} />
          )
        ) : (
          <File className={cn("text-muted-foreground/70 flex-shrink-0", device.isMobile ? "w-5 h-5" : "w-4 h-4")} />
        )}

        {renamingId === item.id ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleRename(renameValue)
              }
              if (e.key === "Escape") {
                e.preventDefault()
                handleCancelRename()
              }
            }}
            onClick={(e) => {
              // Prevent the click from bubbling up and triggering item actions
              e.stopPropagation()
            }}
            className={cn(
              "flex-1 min-w-0 rounded-md border-0 bg-muted/30 px-2 py-1 focus:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-border",
              device.isMobile ? "h-8 text-base" : "h-7 text-sm",
            )}
          />
        ) : (
          <span
            className={cn(
              "flex-1 truncate cursor-pointer min-w-0 py-0.5 text-foreground/90",
              device.isMobile ? "text-base" : "text-sm",
            )}
          >
            {item.name}
          </span>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {device.isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemDoubleClick(item.id, item.name)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate(item.id)
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {item.type === "folder" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowQuickAdd(showQuickAdd === item.id ? null : item.id)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </DropdownMenuItem>
                )}
                {item.id !== "root" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(item.id)
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {showQuickAdd === item.id && (
        <div
          className="content-area p-3 rounded-lg mx-3 mb-2"
          style={{ marginLeft: `${paddingLeft + (device.isMobile ? 20 : 16)}px` }}
        >
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Input
              autoFocus
              placeholder="Enter name..."
              className={cn(
                "flex-1 border-border/50 bg-background/50 focus:bg-background",
                device.isMobile ? "h-10 text-base" : "h-8 text-sm",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  const target = e.target as HTMLInputElement
                  if (target.value) quickAddItem("folder", target.value)
                }
                if (e.key === "Escape") setShowQuickAdd(null)
              }}
              onBlur={handleQuickAddBlur}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className={cn("flex-1 sm:flex-none", device.isMobile ? "h-10 text-sm" : "h-8 text-xs")}
                onClick={() => {
                  const input = document.querySelector(`input[placeholder="Enter name..."]`) as HTMLInputElement
                  if (input?.value) quickAddItem("folder", input.value)
                }}
              >
                <Folder className={cn("mr-1.5", device.isMobile ? "w-4 h-4" : "w-3 h-3")} />
                Folder
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "flex-1 sm:flex-none bg-transparent border-border/50",
                  device.isMobile ? "h-10 text-sm" : "h-8 text-xs",
                )}
                onClick={() => {
                  const input = document.querySelector(`input[placeholder="Enter name..."]`) as HTMLInputElement
                  if (input?.value) quickAddItem("file", input.value)
                }}
              >
                <File className={cn("mr-1.5", device.isMobile ? "w-4 h-4" : "w-3 h-3")} />
                File
              </Button>
            </div>
          </div>
        </div>
      )}

      {item.type === "folder" && item.expanded && item.children && (
        <div>
          {item.children.map((child) => (
            <MobileFileSystemItem
              key={`${child.id}-${child.name}-${child.children?.length || 0}`}
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
})
