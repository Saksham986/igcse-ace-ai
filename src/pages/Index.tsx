import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import AIChat from "@/components/AIChat";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Brain, BarChart3 } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/auth';
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-xl font-semibold mb-2">Loading...</div>
          <div className="text-muted-foreground">Preparing your AI tutor</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-8">
          <div className="container grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resources</CardTitle>
                <CardDescription>Find past papers and mark schemes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => (window.location.href = '/resources')}>Open</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assess</CardTitle>
                <CardDescription>Get examiner-style feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => (window.location.href = '/assess')}>Open</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quiz</CardTitle>
                <CardDescription>Practice MCQs by topic</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => (window.location.href = '/quiz')}>Open</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dashboard</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => (window.location.href = '/dashboard')}>Open</Button>
              </CardContent>
            </Card>
          </div>
        </section>
        <AIChat />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
