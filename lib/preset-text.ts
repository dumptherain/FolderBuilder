import type { FileSystemItem, FolderPreset } from "@/types/folder"
import { generateTemporaryPresetValue } from "@/lib/temporary-preset-manager"
import { generateId } from "@/lib/utils"

function pushChild(parentStack: FileSystemItem[], item: FileSystemItem) {
  const parent = parentStack[parentStack.length - 1]
  if (!parent.children) parent.children = []
  parent.children.push(item)
}

export function parseIndentedPreset(text: string): FolderPreset {
  const lines = text.split(/\r?\n/)
  let rootName = "project"
  let category: string | undefined
  let description: string | undefined

  // Virtual root to collect children
  const root: FileSystemItem = { id: generateId("fs"), name: "__root__", type: "folder", children: [] }
  const stack: FileSystemItem[] = [root]

  const indentUnit = 2

  for (const raw of lines) {
    const line = raw.replace(/\t/g, "  ")
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const lower = trimmed.toLowerCase()
    if (lower.startsWith("root:")) {
      rootName = trimmed.slice(5).trim() || rootName
      continue
    }
    if (lower.startsWith("category:")) {
      category = trimmed.slice(9).trim() || undefined
      continue
    }
    if (lower.startsWith("description:")) {
      description = trimmed.slice(12).trim() || undefined
      continue
    }

    // Determine depth by leading spaces (2 spaces per level)
    const leadingSpaces = line.length - line.trimStart().length
    const depth = Math.floor(leadingSpaces / indentUnit) + 1 // +1 because stack[0] is virtual root

    // Adjust stack to current depth
    while (stack.length > depth) stack.pop()
    while (stack.length < depth) {
      // if indentation jumps, pad with anonymous folders (rare). Use last node to extend.
      const filler: FileSystemItem = { id: generateId("fs"), name: "", type: "folder", children: [] }
      pushChild(stack, filler)
      stack.push(filler)
    }

    const isDir = trimmed.endsWith("/")
    const name = (isDir ? trimmed.slice(0, -1) : trimmed).trim()
    if (!name) continue

    const node: FileSystemItem = {
      id: generateId("fs"),
      name,
      type: isDir ? "folder" : "file",
      expanded: false,
    }
    pushChild(stack, node)
    if (isDir) stack.push(node)
  }

  // Remove any filler empty names
  const clean = (items: FileSystemItem[] | undefined): FileSystemItem[] => {
    if (!items) return []
    return items
      .filter((i) => i.name !== "")
      .map((i) => ({
        ...i,
        children: i.type === "folder" ? clean(i.children) : undefined,
      }))
  }

  const children = clean(root.children)

  const value = generateTemporaryPresetValue(rootName)
  const strip = (i: FileSystemItem): any => ({
    name: i.name,
    type: i.type,
    ...(i.children ? { children: i.children.map(strip) } : i.type === "folder" ? { children: [] } : {}),
  })

  return {
    value,
    label: rootName,
    category,
    description,
    rootName,
    structure: children.map(strip),
  }
}

export function serializeIndentedPreset(
  rootName: string,
  items: FileSystemItem[],
  meta?: { category?: string; description?: string }
): string {
  const out: string[] = []
  out.push(`root: ${rootName}`)
  if (meta?.category) out.push(`category: ${meta.category}`)
  if (meta?.description) out.push(`description: ${meta.description}`)
  out.push("")

  const walk = (list: FileSystemItem[], depth: number) => {
    for (const item of list) {
      const indent = "  ".repeat(depth)
      if (item.type === "folder") {
        out.push(`${indent}${item.name}/`)
        if (item.children?.length) walk(item.children, depth + 1)
      } else {
        out.push(`${indent}${item.name}`)
      }
    }
  }

  walk(items, 0)
  return out.join("\n") + "\n"
}


