import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, User } from "lucide-react";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            Discuss Now
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`p-2 rounded-lg transition-colors ${location.pathname === "/" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              to="/profile"
              className={`p-2 rounded-lg transition-colors ${location.pathname === "/profile" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
            >
              <User className="w-5 h-5" />
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}