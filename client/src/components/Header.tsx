export default function Home() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="/"
            className="text-xl md:text-2xl font-serif font-bold text-primary hover-elevate active-elevate-2 px-2 py-1 rounded-md transition-colors"
          >
            Cozy Wick
          </a>
        </div>
      </nav>
    </header>
  );
}
