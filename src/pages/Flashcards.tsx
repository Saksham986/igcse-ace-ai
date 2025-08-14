import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Flashcard { id?: string; front: string; back: string; subject?: string | null; topic?: string | null; }

const Flashcards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("flashcards")
        .select("id, front, back, subject, topic")
        .order("created_at", { ascending: false })
        .limit(20);
      setCards(data || []);
    };
    load();
  }, [user]);

  const handleGenerate = async () => {
    if (!user) { window.location.href = "/auth"; return; }
    if (!subject && !sourceText) { toast({ variant: "destructive", title: "Provide Subject or Source Text" }); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("generate-flashcards", {
        body: { subject, topic, sourceText, numCards: 12 },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setCards((prev) => [...(data.cards || []), ...prev]);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Generation failed", description: e.message || "Try again" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
            <CardDescription>Generate concise revision cards by subject/topic or from your notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Subject</Label>
                <Input placeholder="e.g., Chemistry (0620)" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label>Topic (optional)</Label>
                <Input placeholder="e.g., Acids & Bases" value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
              <div className="md:col-span-3">
                <Label>Source Text (optional)</Label>
                <Textarea rows={4} placeholder="Paste notes or textbook excerpt" value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleGenerate} disabled={loading}>{loading ? "Generating..." : "Generate Cards"}</Button>
            </div>
          </CardContent>
        </Card>

        {cards.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c, idx) => (
              <div
                key={idx}
                className={`border rounded-xl p-4 cursor-pointer transition-transform ${flipped[idx] ? 'bg-accent/10' : 'bg-card'}`}
                onClick={() => setFlipped((f) => ({ ...f, [idx]: !f[idx] }))}
              >
                <div className="text-xs text-muted-foreground mb-2">{c.subject || ''}{c.topic ? ` • ${c.topic}` : ''}</div>
                <div className="font-semibold mb-2">{flipped[idx] ? 'Answer' : 'Prompt'}</div>
                <div className="text-sm whitespace-pre-wrap">{flipped[idx] ? c.back : c.front}</div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Flashcards;