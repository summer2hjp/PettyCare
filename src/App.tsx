/**
 * App root — wraps all pages with the root layout.
 *
 * Phase 1 placeholder: returns a centered welcome screen.
 * Will be replaced with proper routing + RootLayout in Phase 2.
 */
export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* App Icon */}
        <div className="mx-auto w-20 h-20 rounded-apple-2xl bg-apple-blue
                      flex items-center justify-center shadow-apple-lg">
          <span className="text-4xl">🐾</span>
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-apple-large-title text-apple-label">
            PettyCare
          </h1>
          <p className="text-apple-body text-apple-secondaryLabel">
            Take care of your pets everywhere, everywhen, everytime
          </p>
        </div>

        {/* Phase indicator */}
        <div className="apple-inset-group mt-8">
          <div className="px-6 py-5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-apple-green animate-pulse-soft" />
            <div className="text-left">
              <p className="text-apple-footnote text-apple-secondaryLabel">
                Phase 1 — Design Tokens & Project Skeleton
              </p>
              <p className="text-apple-caption-1 text-apple-tertiaryLabel">
                Ready for UI component development
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
