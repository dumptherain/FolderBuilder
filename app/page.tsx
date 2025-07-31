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
                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600 rounded-md flex items-center justify-center">
                  <span className="text-white dark:text-slate-900 font-semibold text-sm">FS</span>
                </div>
                <h1 className="text-xl font-medium text-foreground">Folder Structure Builder</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 lg:p-10">
        <div className="flex flex-col gap-8 min-h-[calc(100vh-240px)]">
          {/* Main content area - centered */}
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FolderBuilder />
            </div>
          </div>

          {/* Tips panel - same width as main content */}
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <TipsPanel />
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>vibe coded by</span>
              <a
                href="https://www.pascalwiemers.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                Pascal M. Wiemers
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
