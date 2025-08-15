import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AIChat from "@/components/AIChat";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(`${import.meta.env.BASE_URL}auth`, { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Preparing your AI tutor</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/5">
        <div className="text-center">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to IGCSE AI Tutor</h2>
          <p className="text-muted-foreground mb-6">Sign in to start your personalized learning journey</p>
          <Button onClick={() => navigate(`${import.meta.env.BASE_URL}auth`, { replace: true })}>
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <AIChat />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
