import FolderBuilder from "@/components/folder-builder"
import { ThemeToggle } from "@/components/theme-toggle"
import { TipsPanel } from "@/components/tips-panel"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600 rounded-md flex items-center justify-center">
                  <span className="text-white dark:text-slate-900 font-semibold text-xs">FS</span>
                </div>
                <h1 className="text-lg font-medium text-foreground">Folder Structure Builder</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="flex gap-6 h-[calc(100vh-212px)]">
          <div className="flex-1 min-w-0">
            <FolderBuilder />
          </div>
          <TipsPanel />
        </div>
      </div>

      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Vibe coded by</span>
              <a
                href="https://www.pascalwiemers.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                Pascal Wiemers
              </a>
            </div>
            <a
              href="https://www.pascalwiemers.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              www.pascalwiemers.com
            </a>
            <a href="mailto:info@pascalwiemers.com" className="hover:text-foreground transition-colors">
              Feedback: info@pascalwiemers.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
