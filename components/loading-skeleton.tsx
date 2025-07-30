"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, File } from "lucide-react"

export function LoadingSkeleton() {
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
                style={{ width: `${65 + (i * 3) % 30}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 