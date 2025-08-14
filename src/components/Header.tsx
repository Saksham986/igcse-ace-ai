import { Button } from "@/components/ui/button";
import { Menu, User, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">IGCSE AI Tutor</span>
          </div>
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Chat</a>
              <a href="/resources" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Resources</a>
              <a href="/assess" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Assess</a>
              <a href="/quiz" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Quiz</a>
              <a href="/flashcards" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Flashcards</a>
              <a href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Progress</a>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => (window.location.href = "/auth")}>Sign In</Button>
              <Button variant="hero" onClick={() => (window.location.href = "/auth")}>Get Started</Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;