import type { FileSystemItem } from "@/types/folder"

// Sorting function - folders first, then alphabetical
export const sortItems = (items: FileSystemItem[]): FileSystemItem[] => {
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
export const generateIncrementedName = (baseName: string, existingNames: string[]): string => {
  // Check if name starts with a number (like 01_SHOT, 02_Audio, etc.)
  const frontNumberMatch = baseName.match(/^(\d+)(_?)(.*)$/)

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

  // Name has no number suffix, start with "_01" (always use underscore and zero-padding)
  let counter = 1
  let newName = `${baseName}_${counter.toString().padStart(2, "0")}`

  while (existingNames.includes(newName)) {
    counter++
    newName = `${baseName}_${counter.toString().padStart(2, "0")}`
  }
  return newName
}

// Deep clone function for history
export const deepClone = (obj: any): any => {
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

// File system operations
export const updateItem = (
  items: FileSystemItem[],
  itemId: string,
  updates: Partial<FileSystemItem>,
): FileSystemItem[] => {
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

export const addToParent = (items: FileSystemItem[], parentId: string, newItem: FileSystemItem): FileSystemItem[] => {
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

export const deleteItem = (items: FileSystemItem[], idToDelete: string): FileSystemItem[] => {
  return items
    .filter((item) => item.id !== idToDelete)
    .map((item) => {
      if (item.children) {
        return { ...item, children: deleteItem(item.children, idToDelete) }
      }
      return item
    })
}

export const toggleExpanded = (items: FileSystemItem[], id: string): FileSystemItem[] => {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, expanded: !item.expanded }
    }
    if (item.children) {
      return { ...item, children: toggleExpanded(item.children, id) }
    }
    return item
  })
}

export const findItemAndParent = (
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

export const deepCopyItem = (item: FileSystemItem): FileSystemItem => {
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

// Generate tree outline
export const generateOutline = (structure: FileSystemItem[]): string => {
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
