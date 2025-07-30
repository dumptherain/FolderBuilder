"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Folder,
  File,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Archive,
  FolderDown,
  Sparkles,
  Copy,
  Undo,
} from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileSystemItem {
  id: string
  name: string
  type: "file" | "folder"
  children?: FileSystemItem[]
  expanded?: boolean
}

interface HistoryState {
  fileSystem: FileSystemItem[]
  timestamp: number
  action: string
}

const folderPresets = {
  "Getting Started": [
    {
      value: "empty",
      label: "Empty Project",
      rootName: "root",
      structure: [],
    },
  ],
  "Web Development": [
    {
      value: "react-app",
      label: "React App",
      rootName: "my-react-app",
      structure: [
        {
          id: "src",
          name: "src",
          type: "folder" as const,
          children: [
            { id: "components", name: "components", type: "folder" as const, children: [] },
            { id: "hooks", name: "hooks", type: "folder" as const, children: [] },
            { id: "utils", name: "utils", type: "folder" as const, children: [] },
            { id: "styles", name: "styles", type: "folder" as const, children: [] },
            { id: "app.tsx", name: "App.tsx", type: "file" as const },
            { id: "index.tsx", name: "index.tsx", type: "file" as const },
          ],
        },
        {
          id: "public",
          name: "public",
          type: "folder" as const,
          children: [
            { id: "images", name: "images", type: "folder" as const, children: [] },
            { id: "fonts", name: "fonts", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "tests",
          name: "tests",
          type: "folder" as const,
          children: [
            { id: "unit", name: "unit", type: "folder" as const, children: [] },
            { id: "integration", name: "integration", type: "folder" as const, children: [] },
          ],
        },
        { id: "package.json", name: "package.json", type: "file" as const },
        { id: "readme.md", name: "README.md", type: "file" as const },
      ],
    },
    {
      value: "nextjs-app",
      label: "Next.js App",
      rootName: "my-nextjs-app",
      structure: [
        {
          id: "app",
          name: "app",
          type: "folder" as const,
          children: [
            { id: "globals.css", name: "globals.css", type: "file" as const },
            { id: "layout.tsx", name: "layout.tsx", type: "file" as const },
            { id: "page.tsx", name: "page.tsx", type: "file" as const },
          ],
        },
        {
          id: "components",
          name: "components",
          type: "folder" as const,
          children: [{ id: "ui", name: "ui", type: "folder" as const, children: [] }],
        },
        { id: "lib", name: "lib", type: "folder" as const, children: [] },
        {
          id: "public",
          name: "public",
          type: "folder" as const,
          children: [
            { id: "images", name: "images", type: "folder" as const, children: [] },
            { id: "videos", name: "videos", type: "folder" as const, children: [] },
          ],
        },
        { id: "package.json", name: "package.json", type: "file" as const },
      ],
    },
  ],
  "Backend Development": [
    {
      value: "node-api",
      label: "Node.js API",
      rootName: "my-api-server",
      structure: [
        {
          id: "src",
          name: "src",
          type: "folder" as const,
          children: [
            { id: "controllers", name: "controllers", type: "folder" as const, children: [] },
            { id: "middleware", name: "middleware", type: "folder" as const, children: [] },
            { id: "models", name: "models", type: "folder" as const, children: [] },
            { id: "routes", name: "routes", type: "folder" as const, children: [] },
            { id: "services", name: "services", type: "folder" as const, children: [] },
            { id: "utils", name: "utils", type: "folder" as const, children: [] },
            { id: "app.js", name: "app.js", type: "file" as const },
            { id: "server.js", name: "server.js", type: "file" as const },
          ],
        },
        {
          id: "tests",
          name: "tests",
          type: "folder" as const,
          children: [
            { id: "unit", name: "unit", type: "folder" as const, children: [] },
            { id: "integration", name: "integration", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "configs",
          name: "configs",
          type: "folder" as const,
          children: [
            { id: "dev", name: "dev", type: "folder" as const, children: [] },
            { id: "prod", name: "prod", type: "folder" as const, children: [] },
          ],
        },
        { id: "package.json", name: "package.json", type: "file" as const },
        { id: "readme.md", name: "README.md", type: "file" as const },
      ],
    },
  ],
  "Creative & Media": [
    {
      value: "video-production",
      label: "Video Production",
      rootName: "video-project",
      structure: [
        {
          id: "01_footage",
          name: "01_Footage",
          type: "folder" as const,
          children: [
            { id: "camera_a", name: "Camera_A", type: "folder" as const, children: [] },
            { id: "camera_b", name: "Camera_B", type: "folder" as const, children: [] },
            { id: "b_roll", name: "B-Roll", type: "folder" as const, children: [] },
            { id: "proxies", name: "Proxies", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "02_audio",
          name: "02_Audio",
          type: "folder" as const,
          children: [
            { id: "dialogue", name: "Dialogue", type: "folder" as const, children: [] },
            { id: "music", name: "Music", type: "folder" as const, children: [] },
            { id: "sound_effects", name: "Sound_Effects", type: "folder" as const, children: [] },
            { id: "voiceover", name: "Voiceover", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "03_projects",
          name: "03_Projects",
          type: "folder" as const,
          children: [
            { id: "premiere", name: "Premiere", type: "folder" as const, children: [] },
            { id: "after_effects", name: "After_Effects", type: "folder" as const, children: [] },
            { id: "backups", name: "Backups", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "04_exports",
          name: "04_Exports",
          type: "folder" as const,
          children: [
            { id: "social", name: "Social", type: "folder" as const, children: [] },
            { id: "client", name: "Client", type: "folder" as const, children: [] },
            { id: "internal", name: "Internal", type: "folder" as const, children: [] },
          ],
        },
        { id: "05_thumbnails", name: "05_Thumbnails", type: "folder" as const, children: [] },
        {
          id: "06_delivery",
          name: "06_Delivery",
          type: "folder" as const,
          children: [
            { id: "final", name: "Final", type: "folder" as const, children: [] },
            { id: "versions", name: "Versions", type: "folder" as const, children: [] },
          ],
        },
      ],
    },
    {
      value: "3d-modeling",
      label: "3D Modeling & Animation",
      rootName: "3d-project",
      structure: [
        {
          id: "01_assets",
          name: "01_Assets",
          type: "folder" as const,
          children: [
            { id: "models", name: "Models", type: "folder" as const, children: [] },
            { id: "textures", name: "Textures", type: "folder" as const, children: [] },
            { id: "lookdev", name: "Lookdev", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "02_scenes",
          name: "02_Scenes",
          type: "folder" as const,
          children: [
            { id: "blocking", name: "Blocking", type: "folder" as const, children: [] },
            { id: "animation", name: "Animation", type: "folder" as const, children: [] },
            { id: "lighting", name: "Lighting", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "03_renders",
          name: "03_Renders",
          type: "folder" as const,
          children: [
            { id: "exr", name: "EXR", type: "folder" as const, children: [] },
            { id: "jpeg", name: "JPEG", type: "folder" as const, children: [] },
            { id: "turntables", name: "Turntables", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "04_deliveries",
          name: "04_Deliveries",
          type: "folder" as const,
          children: [
            { id: "client", name: "Client", type: "folder" as const, children: [] },
            { id: "review", name: "Review", type: "folder" as const, children: [] },
            { id: "archive", name: "Archive", type: "folder" as const, children: [] },
          ],
        },
      ],
    },
    {
      value: "pw-project",
      label: "PW Project",
      rootName: "YYMMDD_AGENCY_CLIENT",
      structure: [
        {
          id: "1-IN",
          name: "1-IN",
          type: "folder" as const,
          children: [{ id: "in-date", name: "YYMMDD", type: "folder" as const, children: [] }],
        },
        {
          id: "2-WORK",
          name: "2-WORK",
          type: "folder" as const,
          children: [
            { id: "blender", name: "blender", type: "folder" as const, children: [] },
            {
              id: "houdini",
              name: "houdini",
              type: "folder" as const,
              children: [
                {
                  id: "shot-01",
                  name: "SHOT_01",
                  type: "folder" as const,
                  children: [
                    { id: "cache", name: "cache", type: "folder" as const, children: [] },
                    { id: "geo", name: "geo", type: "folder" as const, children: [] },
                    { id: "hdri", name: "hdri", type: "folder" as const, children: [] },
                    { id: "tex", name: "tex", type: "folder" as const, children: [] },
                    { id: "usd", name: "usd", type: "folder" as const, children: [] },
                  ],
                },
              ],
            },
            { id: "nuke", name: "nuke", type: "folder" as const, children: [] },
            { id: "pureref", name: "pureref", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "3-DAILIES",
          name: "3-DAILIES",
          type: "folder" as const,
          children: [{ id: "dailies-date", name: "YYMMDD", type: "folder" as const, children: [] }],
        },
        {
          id: "4-OUT",
          name: "4-OUT",
          type: "folder" as const,
          children: [{ id: "out-date", name: "YYMMDD", type: "folder" as const, children: [] }],
        },
        { id: "5-CASE", name: "5-CASE", type: "folder" as const, children: [] },
      ],
    },
  ],
  "Business & Admin": [
    {
      value: "client-projects",
      label: "Client Projects",
      rootName: "client-work",
      structure: [
        { id: "01_briefs", name: "01_Briefs", type: "folder" as const, children: [] },
        {
          id: "02_contracts",
          name: "02_Contracts",
          type: "folder" as const,
          children: [
            { id: "signed", name: "Signed", type: "folder" as const, children: [] },
            { id: "drafts", name: "Drafts", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "03_workfiles",
          name: "03_Workfiles",
          type: "folder" as const,
          children: [
            { id: "versions", name: "Versions", type: "folder" as const, children: [] },
            { id: "archive", name: "Archive", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "04_assets",
          name: "04_Assets",
          type: "folder" as const,
          children: [
            { id: "logos", name: "Logos", type: "folder" as const, children: [] },
            { id: "fonts", name: "Fonts", type: "folder" as const, children: [] },
            { id: "references", name: "References", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "05_deliveries",
          name: "05_Deliveries",
          type: "folder" as const,
          children: [
            { id: "preview", name: "Preview", type: "folder" as const, children: [] },
            { id: "final", name: "Final", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "06_invoices",
          name: "06_Invoices",
          type: "folder" as const,
          children: [
            { id: "sent", name: "Sent", type: "folder" as const, children: [] },
            { id: "paid", name: "Paid", type: "folder" as const, children: [] },
          ],
        },
      ],
    },
  ],
  "Data & Research": [
    {
      value: "data-science",
      label: "Data Science Project",
      rootName: "data-project",
      structure: [
        {
          id: "data",
          name: "data",
          type: "folder" as const,
          children: [
            { id: "raw", name: "raw", type: "folder" as const, children: [] },
            { id: "processed", name: "processed", type: "folder" as const, children: [] },
            { id: "external", name: "external", type: "folder" as const, children: [] },
            { id: "interim", name: "interim", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "notebooks",
          name: "notebooks",
          type: "folder" as const,
          children: [
            { id: "exploratory", name: "exploratory", type: "folder" as const, children: [] },
            { id: "production", name: "production", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "models",
          name: "models",
          type: "folder" as const,
          children: [
            { id: "trained", name: "trained", type: "folder" as const, children: [] },
            { id: "versioned", name: "versioned", type: "folder" as const, children: [] },
            { id: "exports", name: "exports", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "scripts",
          name: "scripts",
          type: "folder" as const,
          children: [
            { id: "preprocessing", name: "preprocessing", type: "folder" as const, children: [] },
            { id: "training", name: "training", type: "folder" as const, children: [] },
            { id: "evaluation", name: "evaluation", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "results",
          name: "results",
          type: "folder" as const,
          children: [
            { id: "plots", name: "plots", type: "folder" as const, children: [] },
            { id: "metrics", name: "metrics", type: "folder" as const, children: [] },
            { id: "summaries", name: "summaries", type: "folder" as const, children: [] },
          ],
        },
        { id: "figures", name: "figures", type: "folder" as const, children: [] },
      ],
    },
  ],
  "Content Creation": [
    {
      value: "youtube-channel",
      label: "YouTube Channel",
      rootName: "youtube-content",
      structure: [
        { id: "ideas", name: "Ideas", type: "folder" as const, children: [] },
        { id: "scripts", name: "Scripts", type: "folder" as const, children: [] },
        {
          id: "footage",
          name: "Footage",
          type: "folder" as const,
          children: [
            { id: "a_roll", name: "A-Roll", type: "folder" as const, children: [] },
            { id: "b_roll", name: "B-Roll", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "edits",
          name: "Edits",
          type: "folder" as const,
          children: [
            { id: "shorts", name: "Shorts", type: "folder" as const, children: [] },
            { id: "full", name: "Full", type: "folder" as const, children: [] },
          ],
        },
        { id: "thumbnails", name: "Thumbnails", type: "folder" as const, children: [] },
        {
          id: "published",
          name: "Published",
          type: "folder" as const,
          children: [
            { id: "2024", name: "2024", type: "folder" as const, children: [] },
            { id: "2025", name: "2025", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "exports",
          name: "Exports",
          type: "folder" as const,
          children: [
            { id: "youtube", name: "YouTube", type: "folder" as const, children: [] },
            { id: "instagram", name: "Instagram", type: "folder" as const, children: [] },
          ],
        },
      ],
    },
  ],
  Documentation: [
    {
      value: "docs-site",
      label: "Documentation Site",
      rootName: "my-docs-site",
      structure: [
        {
          id: "docs",
          name: "docs",
          type: "folder" as const,
          children: [
            { id: "getting-started", name: "getting-started", type: "folder" as const, children: [] },
            { id: "api", name: "api", type: "folder" as const, children: [] },
            { id: "guides", name: "guides", type: "folder" as const, children: [] },
          ],
        },
        {
          id: "assets",
          name: "assets",
          type: "folder" as const,
          children: [
            { id: "images", name: "images", type: "folder" as const, children: [] },
            { id: "css", name: "css", type: "folder" as const, children: [] },
          ],
        },
        { id: "config.yml", name: "config.yml", type: "file" as const },
        { id: "readme.md", name: "README.md", type: "file" as const },
      ],
    },
  ],
}

// Sorting function - folders first, then alphabetical
const sortItems = (items: FileSystemItem[]): FileSystemItem[] => {
  return [...items].sort((a, b) => {
    // Folders come first
    if (a.type === "folder" && b.type === "file") return -1
    if (a.type === "file" && b.type === "folder") return 1

    // Within same type, sort alphabetically with natural number sorting
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  })
}

// Generate incremented name for duplicates with smart number detection
const generateIncrementedName = (baseName: string, existingNames: string[]): string => {
  // Check if name starts with a number (like 01_SHOT, 02_Audio, etc.)
  const frontNumberMatch = baseName.match(/^(\d+)(_?)(.+)$/)

  if (frontNumberMatch) {
    // Name starts with a number, increment it
    const [, numStr, separator, nameRest] = frontNumberMatch
    let counter = Number.parseInt(numStr) + 1
    const paddingLength = numStr.length // Preserve zero-padding

    let newName = `${counter.toString().padStart(paddingLength, "0")}${separator}${nameRest}`

    while (existingNames.includes(newName)) {
      counter++
      newName = `${counter.toString().padStart(paddingLength, "0")}${separator}${nameRest}`
    }
    return newName
  }

  // Check if name ends with a number (like SHOT_01, file_2, etc.)
  const numberSuffixMatch = baseName.match(/^(.+?)(_?)(\d+)$/)

  if (numberSuffixMatch) {
    // Name ends with a number, increment it
    const [, namePrefix, separator, numStr] = numberSuffixMatch
    let counter = Number.parseInt(numStr) + 1
    const paddingLength = numStr.length // Preserve zero-padding

    let newName = `${namePrefix}${separator}${counter.toString().padStart(paddingLength, "0")}`

    while (existingNames.includes(newName)) {
      counter++
      newName = `${namePrefix}${separator}${counter.toString().padStart(paddingLength, "0")}`
    }
    return newName
  }

  // Check if name already has a space-separated number suffix (like "Item 2")
  const spaceNumberMatch = baseName.match(/^(.+?)(\s+)(\d+)$/)

  if (spaceNumberMatch) {
    // Name has space + number suffix, increment it
    const [, name, space, num] = spaceNumberMatch
    let counter = Number.parseInt(num) + 1
    let newName = `${name}${space}${counter}`

    while (existingNames.includes(newName)) {
      counter++
      newName = `${name}${space}${counter}`
    }
    return newName
  } else {
    // Name has no number suffix, start with " 2"
    let counter = 2
    let newName = `${baseName} ${counter}`

    while (existingNames.includes(newName)) {
      counter++
      newName = `${baseName} ${counter}`
    }
    return newName
  }
}

// Deep clone function for history
const deepClone = (obj: any): any => {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map((item) => deepClone(item))
  if (typeof obj === "object") {
    const clonedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

export default function FolderBuilder() {
  const initialFileSystem = [{ id: "root", name: "root", type: "folder" as const, children: [], expanded: true }]

  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(initialFileSystem)
  const [history, setHistory] = useState<HistoryState[]>([
    { fileSystem: deepClone(initialFileSystem), timestamp: Date.now(), action: "Initial state" },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showQuickAdd, setShowQuickAdd] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState("")
  const [mounted, setMounted] = useState(false)
  const [clickTimeouts, setClickTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map())

  const renameInputRef = useRef<HTMLInputElement>(null)

  // Add to history function
  const addToHistory = useCallback(
    (newFileSystem: FileSystemItem[], action: string) => {
      // Remove expansion states before storing in history
      const stripExpansionStates = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          const { expanded, ...itemWithoutExpansion } = item
          return {
            ...itemWithoutExpansion,
            children: item.children ? stripExpansionStates(item.children) : item.children,
          }
        })
      }

      const newHistoryState: HistoryState = {
        fileSystem: deepClone(stripExpansionStates(newFileSystem)),
        timestamp: Date.now(),
        action,
      }

      // Remove any future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newHistoryState)

      // Limit history to 50 states to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift()
      } else {
        setHistoryIndex(historyIndex + 1)
      }

      setHistory(newHistory)
    },
    [history, historyIndex],
  )

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      // Get current expansion states before undoing
      const getCurrentExpansionStates = (items: FileSystemItem[]): Map<string, boolean> => {
        const expansionMap = new Map<string, boolean>()

        const traverse = (items: FileSystemItem[]) => {
          items.forEach((item) => {
            if (item.type === "folder" && item.expanded !== undefined) {
              expansionMap.set(item.id, item.expanded)
            }
            if (item.children) {
              traverse(item.children)
            }
          })
        }

        traverse(items)
        return expansionMap
      }

      // Apply expansion states to restored structure
      const applyExpansionStates = (items: FileSystemItem[], expansionMap: Map<string, boolean>): FileSystemItem[] => {
        return items.map((item) => {
          const restoredItem = { ...item }

          if (item.type === "folder") {
            // Preserve expansion state if it exists, otherwise default to false
            restoredItem.expanded = expansionMap.get(item.id) ?? false
          }

          if (item.children) {
            restoredItem.children = applyExpansionStates(item.children, expansionMap)
          }

          return restoredItem
        })
      }

      const currentExpansionStates = getCurrentExpansionStates(fileSystem)
      const newIndex = historyIndex - 1
      const restoredStructure = deepClone(history[newIndex].fileSystem)
      const structureWithExpansion = applyExpansionStates(restoredStructure, currentExpansionStates)

      setHistoryIndex(newIndex)
      setFileSystem(structureWithExpansion)
      setRenamingId(null) // Cancel any active renaming
      setShowQuickAdd(null) // Cancel any active quick add
    }
  }, [historyIndex, history, fileSystem])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleUndo])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      clickTimeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [clickTimeouts])

  const updateItem = (items: FileSystemItem[], itemId: string, updates: Partial<FileSystemItem>): FileSystemItem[] => {
    return items.map((item) => {
      if (item.id === itemId) {
        return { ...item, ...updates }
      }
      if (item.children) {
        return { ...item, children: updateItem(item.children, itemId, updates) }
      }
      return item
    })
  }

  const handleRename = (itemId: string, newName: string) => {
    if (newName.trim()) {
      const newFileSystem = updateItem(fileSystem, itemId, { name: newName.trim() })
      setFileSystem(newFileSystem)
      addToHistory(newFileSystem, `Renamed item to "${newName.trim()}"`)
    }
    setRenamingId(null)
  }

  const addToParent = (items: FileSystemItem[], parentId: string, newItem: FileSystemItem): FileSystemItem[] => {
    return items.map((item) => {
      if (item.id === parentId && item.type === "folder") {
        const newChildren = [...(item.children || []), newItem]
        return { ...item, expanded: true, children: sortItems(newChildren) }
      }
      if (item.children) {
        return { ...item, children: addToParent(item.children, parentId, newItem) }
      }
      return item
    })
  }

  const deleteItem = (items: FileSystemItem[], idToDelete: string): FileSystemItem[] => {
    return items
      .filter((item) => item.id !== idToDelete)
      .map((item) => {
        if (item.children) {
          return { ...item, children: deleteItem(item.children, idToDelete) }
        }
        return item
      })
  }

  const handleDelete = (id: string) => {
    const newFileSystem = deleteItem(fileSystem, id)
    setFileSystem(newFileSystem)
    addToHistory(newFileSystem, "Deleted item")
  }

  const handleDuplicate = (id: string) => {
    const findItemAndParent = (
      items: FileSystemItem[],
      targetId: string,
      parentId?: string,
    ): { item: FileSystemItem; parentId?: string; siblings: FileSystemItem[] } | null => {
      for (const item of items) {
        if (item.id === targetId) {
          return { item, parentId, siblings: items }
        }
        if (item.children) {
          const result = findItemAndParent(item.children, targetId, item.id)
          if (result) return result
        }
      }
      return null
    }

    // Deep copy function to recursively duplicate entire folder structures
    const deepCopyItem = (item: FileSystemItem): FileSystemItem => {
      const newItem: FileSystemItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: item.name, // Name will be updated for root item only
        type: item.type,
        expanded: false, // Reset expansion state for duplicated items
      }

      // Recursively copy children if they exist
      if (item.children && item.children.length > 0) {
        newItem.children = item.children.map((child) => deepCopyItem(child))
      } else if (item.type === "folder") {
        newItem.children = []
      }

      return newItem
    }

    const result = findItemAndParent(fileSystem, id)
    if (!result) return

    const { item, parentId, siblings } = result
    const existingNames = siblings.map((sibling) => sibling.name)
    const newName = generateIncrementedName(item.name, existingNames)

    // Deep copy the entire item structure
    const duplicatedItem = deepCopyItem(item)
    // Update only the root item's name with the incremented version
    duplicatedItem.name = newName

    let newFileSystem: FileSystemItem[]
    if (parentId) {
      newFileSystem = addToParent(fileSystem, parentId, duplicatedItem)
    } else {
      // Duplicating root item
      newFileSystem = sortItems([...fileSystem, duplicatedItem])
    }

    setFileSystem(newFileSystem)
    addToHistory(newFileSystem, `Duplicated "${item.name}" as "${newName}"`)
  }

  const toggleExpanded = (id: string) => {
    const findAndToggle = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded }
        }
        if (item.children) {
          return { ...item, children: findAndToggle(item.children) }
        }
        return item
      })
    }
    const newFileSystem = findAndToggle(fileSystem)
    setFileSystem(newFileSystem)
    // Don't add expand/collapse to history as it's not a structural change
  }

  const handleItemClick = (itemId: string) => {
    if (clickTimeouts.has(itemId)) {
      // This is a double-click, clear the timeout and don't expand
      const timeout = clickTimeouts.get(itemId)!
      clearTimeout(timeout)
      setClickTimeouts((prev) => {
        const newMap = new Map(prev)
        newMap.delete(itemId)
        return newMap
      })
      return
    }

    // Set a timeout for single click
    const timeout = setTimeout(() => {
      toggleExpanded(itemId)
      setClickTimeouts((prev) => {
        const newMap = new Map(prev)
        newMap.delete(itemId)
        return newMap
      })
    }, 200) // 200ms delay to detect double-click

    setClickTimeouts((prev) => {
      const newMap = new Map(prev)
      newMap.set(itemId, timeout)
      return newMap
    })
  }

  const handleItemDoubleClick = (itemId: string, itemName: string) => {
    // Clear any pending single-click timeout
    if (clickTimeouts.has(itemId)) {
      const timeout = clickTimeouts.get(itemId)!
      clearTimeout(timeout)
      setClickTimeouts((prev) => {
        const newMap = new Map(prev)
        newMap.delete(itemId)
        return newMap
      })
    }

    // Handle rename
    setRenamingId(itemId)
    setRenameValue(itemName)
  }

  const quickAddItem = (parentId: string, type: "file" | "folder", name: string) => {
    if (!name.trim()) return
    const newItem: FileSystemItem = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      children: type === "folder" ? [] : undefined,
      expanded: false,
    }
    const newFileSystem = addToParent(fileSystem, parentId, newItem)
    setFileSystem(newFileSystem)
    addToHistory(newFileSystem, `Added ${type} "${name.trim()}"`)
    setShowQuickAdd(null)
  }

  const loadPreset = (presetValue: string) => {
    let foundPreset = null

    // Find preset across all categories
    for (const [category, presets] of Object.entries(folderPresets)) {
      foundPreset = presets.find((p) => p.value === presetValue)
      if (foundPreset) break
    }

    if (!foundPreset) return

    const assignIds = (items: any[]): FileSystemItem[] => {
      return sortItems(
        items.map((item) => ({
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          children: item.children ? assignIds(item.children) : undefined,
          expanded: false,
        })),
      )
    }

    const newFileSystem = [
      {
        id: "root",
        name: foundPreset.rootName,
        type: "folder" as const,
        children: assignIds(foundPreset.structure),
        expanded: true,
      },
    ]

    setFileSystem(newFileSystem)
    addToHistory(newFileSystem, `Loaded preset "${foundPreset.label}"`)
    setSelectedPreset("")
    setPresetOpen(false)
  }

  const renderFileSystemItem = (item: FileSystemItem, level = 0) => (
    <div key={item.id} className="relative">
      <div
        className="group flex items-center gap-2.5 px-3 py-2 hover:bg-accent/40 rounded-lg transition-all duration-150 min-h-[40px] cursor-pointer"
        style={{ paddingLeft: `${Math.min(level * 20, 60) + 12}px` }}
        onClick={() => {
          if (item.type === "folder") {
            handleItemClick(item.id)
          }
        }}
        onDoubleClick={() => handleItemDoubleClick(item.id, item.name)}
      >
        {item.type === "folder" && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleExpanded(item.id)
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
            onBlur={() => handleRename(item.id, renameValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename(item.id, renameValue)
              if (e.key === "Escape") setRenamingId(null)
            }}
            className="h-7 text-sm flex-1 min-w-0 rounded-md border-0 bg-muted/30 px-2 py-1 focus:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-border"
          />
        ) : (
          <span className="flex-1 text-sm truncate cursor-pointer min-w-0 py-0.5 text-foreground/90">{item.name}</span>
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
              handleDuplicate(item.id)
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
                handleDelete(item.id)
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
                  if (target.value) quickAddItem(item.id, "folder", target.value)
                }
                if (e.key === "Escape") setShowQuickAdd(null)
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 flex-1 sm:flex-none text-xs"
                onClick={() => {
                  if (!mounted) return
                  const input = document.querySelector(`input[placeholder="Enter name..."]`) as HTMLInputElement
                  if (input?.value) quickAddItem(item.id, "folder", input.value)
                }}
              >
                <Folder className="w-3 h-3 mr-1.5" />
                Folder
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 sm:flex-none text-xs bg-transparent border-border/50"
                onClick={() => {
                  if (!mounted) return
                  const input = document.querySelector(`input[placeholder="Enter name..."]`) as HTMLInputElement
                  if (input?.value) quickAddItem(item.id, "file", input.value)
                }}
              >
                <File className="w-3 h-3 mr-1.5" />
                File
              </Button>
            </div>
          </div>
        </div>
      )}

      {item.type === "folder" && item.expanded && item.children && (
        <div>{item.children.map((child) => renderFileSystemItem(child, level + 1))}</div>
      )}
    </div>
  )

  const generateOutline = (structure: FileSystemItem[]): string => {
    const rootName = structure[0]?.name || "root"
    let treeString = `📁 ${rootName}\n`
    const buildTree = (items: FileSystemItem[], prefix: string) => {
      items.forEach((item, index) => {
        const isLast = index === items.length - 1
        const connector = isLast ? "└─" : "├─"
        const icon = item.type === "folder" ? "📁" : "📄"
        treeString += `${prefix}${connector} ${icon} ${item.name}\n`

        if (item.children && item.children.length > 0) {
          const newPrefix = prefix + (isLast ? "    " : "│   ")
          buildTree(item.children, newPrefix)
        }
      })
    }
    if (structure[0] && structure[0].children) {
      buildTree(structure[0].children, "")
    }
    return treeString
  }

  // File System Access API approach (modern browsers)
  const downloadAsFolder = async () => {
    if (!mounted) return

    if (!("showDirectoryPicker" in window)) {
      alert("Your browser doesn't support direct folder creation. Please use the ZIP download instead.")
      return
    }

    try {
      setIsDownloading(true)

      // Ask user to select a directory
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: "readwrite",
      })

      const createStructure = async (items: FileSystemItem[], parentHandle: any) => {
        for (const item of items) {
          if (item.type === "folder") {
            // Create folder
            const folderHandle = await parentHandle.getDirectoryHandle(item.name, { create: true })

            // Create children if they exist
            if (item.children && item.children.length > 0) {
              await createStructure(item.children, folderHandle)
            } else {
              // Create .gitkeep for empty folders
              const fileHandle = await folderHandle.getFileHandle(".gitkeep", { create: true })
              const writable = await fileHandle.createWritable()
              await writable.write("")
              await writable.close()
            }
          } else {
            // Create file
            const fileHandle = await parentHandle.getFileHandle(item.name, { create: true })
            const writable = await fileHandle.createWritable()
            await writable.write("")
            await writable.close()
          }
        }
      }

      // Create the structure
      if (fileSystem[0]?.children) {
        await createStructure(fileSystem[0].children, dirHandle)
      }

      alert("Folder structure created successfully!")
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // User cancelled the directory picker
        return
      }
      console.error("Error creating folder structure:", error)
      alert("Error creating folder structure. Your browser might not support this feature.")
    } finally {
      setIsDownloading(false)
    }
  }

  // ZIP download fallback
  const downloadAsZip = async () => {
    if (!mounted) return

    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      const addToZip = (items: FileSystemItem[], currentPath = "") => {
        items.forEach((item) => {
          const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name

          if (item.type === "folder") {
            zip.folder(itemPath)
            if (item.children && item.children.length > 0) {
              addToZip(item.children, itemPath)
            } else {
              zip.file(`${itemPath}/.gitkeep`, "")
            }
          } else {
            zip.file(itemPath, "")
          }
        })
      }

      if (fileSystem[0]?.children) {
        addToZip(fileSystem[0].children)
      }

      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = `${fileSystem[0]?.name || "folder-structure"}-${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error creating zip file:", error)
      alert("Error creating folder structure. Please try again.")
    }
  }

  const hasFileSystemAccess = mounted && "showDirectoryPicker" in window
  const canUndo = historyIndex > 0

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <Card className="refined-card flex flex-col">
          <CardHeader className="pb-4 border-b border-border/30">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="flex items-center gap-2.5 text-base font-medium">
                <Folder className="w-4 h-4 text-blue-500/80" />
                Structure Builder
              </CardTitle>
            </div>
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
              <div className="h-8 bg-muted/50 rounded animate-pulse flex-1" />
              <div className="h-8 bg-muted/50 rounded animate-pulse w-24" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="refined-card flex flex-col">
          <CardHeader className="border-b border-border/30">
            <CardTitle className="flex items-center gap-2.5 text-base font-medium">
              <File className="w-4 h-4 text-muted-foreground/70" />
              Structure Outline
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-muted/50 rounded animate-pulse"
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <Card className="refined-card flex flex-col">
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="flex items-center gap-2.5 text-base font-medium">
              <Folder className="w-4 h-4 text-blue-500/80" />
              Structure Builder
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground/80">
            Click to expand • Double-click to rename • Hover to add or delete • Ctrl+Z to undo
          </p>

          <div className="flex flex-col gap-2.5 pt-3">
            <Popover open={presetOpen} onOpenChange={setPresetOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={presetOpen}
                  className="w-full justify-between bg-transparent border-border/50 h-8 text-xs"
                  size="sm"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500/70" />
                    <span className="hidden sm:inline">Load Preset</span>
                    <span className="sm:hidden">Preset</span>
                  </div>
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0 border-border/50">
                <Command>
                  <CommandInput placeholder="Search presets..." className="h-8 text-xs" />
                  <CommandList>
                    <CommandEmpty className="text-xs">No preset found.</CommandEmpty>
                    {Object.entries(folderPresets).map(([category, presets]) => (
                      <CommandGroup key={category} heading={category}>
                        {presets.map((preset) => (
                          <CommandItem
                            key={preset.value}
                            value={preset.value}
                            onSelect={(currentValue) => {
                              loadPreset(currentValue)
                            }}
                            className="text-xs"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-3.5 w-3.5",
                                selectedPreset === preset.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {preset.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              <Button
                onClick={handleUndo}
                size="sm"
                variant="outline"
                className="flex items-center gap-1.5 h-8 text-xs bg-transparent border-border/50 justify-center"
                disabled={!canUndo}
                title={`Undo ${canUndo ? `(${history[historyIndex]?.action})` : ""}`}
              >
                <Undo className="w-3.5 h-3.5" />
                <span className="hidden sm:inline lg:hidden xl:inline">Undo</span>
              </Button>

              {hasFileSystemAccess && (
                <Button
                  onClick={downloadAsFolder}
                  size="sm"
                  className="flex items-center gap-1.5 h-8 text-xs justify-center"
                  disabled={!fileSystem[0]?.children?.length || isDownloading}
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline lg:hidden xl:inline">{isDownloading ? "Creating..." : "Save"}</span>
                </Button>
              )}

              <Button
                onClick={downloadAsZip}
                size="sm"
                variant="outline"
                className="flex items-center gap-1.5 bg-transparent border-border/50 h-8 text-xs justify-center"
                disabled={!fileSystem[0]?.children?.length}
              >
                <Archive className="w-3.5 h-3.5" />
                <span className="hidden sm:inline lg:hidden xl:inline">ZIP</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="p-2">{fileSystem.map((item) => renderFileSystemItem(item))}</div>
        </CardContent>
      </Card>

      <Card className="refined-card flex flex-col">
        <CardHeader className="border-b border-border/30">
          <CardTitle className="flex items-center gap-2.5 text-base font-medium">
            <File className="w-4 h-4 text-muted-foreground/70" />
            Structure Outline
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4">
          {fileSystem[0]?.children?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground/60">
              <div className="text-3xl mb-3">🌳</div>
              <p className="text-sm">Your folder structure will appear here</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Start by adding items to the root folder</p>
            </div>
          ) : (
            <div className="content-area rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto">
              <pre className="whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal text-foreground/90">
                {generateOutline(fileSystem)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
