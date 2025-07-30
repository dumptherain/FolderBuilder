"use client"

import { Folder, File } from "lucide-react"
import type { FolderStructure } from "../types/folder"

interface FolderOutlineProps {
  folderStructure: FolderStructure
}

export function FolderOutline({ folderStructure }: FolderOutlineProps) {
  const renderTree = (item: FolderStructure, depth = 0) => {
    const indent = depth * 20

    return (
      <div key={item.id}>
        <div className="flex items-center gap-2 py-1 text-sm" style={{ paddingLeft: `${indent}px` }}>
          {item.type === "folder" ? (
            <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
          ) : (
            <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
          )}
          <span className="truncate">{item.name}</span>
        </div>

        {item.children && item.children.length > 0 && (
          <div>{item.children.map((child) => renderTree(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {folderStructure.children && folderStructure.children.length > 0 ? (
        <div className="font-mono text-sm bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <Folder className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">root</span>
          </div>
          {folderStructure.children.map((child) => renderTree(child, 1))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Folder className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No folders or files yet</p>
          <p className="text-xs text-gray-400 mt-1">Start building your structure on the left</p>
        </div>
      )}
    </div>
  )
}
