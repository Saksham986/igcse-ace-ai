import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Resources = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [session, setSession] = useState("");
  const [paper, setPaper] = useState("");
  const [results, setResults] = useState<{ title: string; url: string }[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("resource-search", {
        body: { subject, year, session, paper },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (error) throw error;
      setResults(data.results || []);
      setSuggestions(data.suggestions || []);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Search failed", description: e.message || "Try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resource Finder</CardTitle>
            <CardDescription>Find IGCSE past papers, mark schemes, and examiner reports quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Subject</Label>
                <Input placeholder="e.g., Physics (0625)" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label>Year</Label>
                <Input placeholder="e.g., 2023" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
              <div>
                <Label>Session</Label>
                <Input placeholder="e.g., May June" value={session} onChange={(e) => setSession(e.target.value)} />
              </div>
              <div>
                <Label>Paper</Label>
                <Input placeholder="e.g., Paper 2" value={paper} onChange={(e) => setPaper(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {suggestions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 text-sm text-muted-foreground">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.map((r, i) => (
                  <li key={i}>
                    <a href={r.url} className="text-primary underline" target="_blank" rel="noreferrer">
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Resources;