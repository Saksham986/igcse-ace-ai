import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

const Quiz = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [items, setItems] = useState<QuizItem[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<{ total: number; outOf: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    if (!subject) {
      toast({ variant: "destructive", title: "Subject required", description: "Enter a subject" });
      return;
    }
    setLoading(true);
    setScore(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { subject, topic, numQuestions: 6 },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setItems(data.items || []);
      setAnswers(new Array((data.items || []).length).fill(-1));
      setQuizId(data.quizId || null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Generation failed", description: e.message || "Try again" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const correct = items.reduce((acc, item, idx) => (answers[idx] === item.correctIndex ? acc + 1 : acc), 0);
    const outOf = items.length;
    setScore({ total: correct, outOf });

    if (user && quizId) {
      try {
        await supabase.from("quiz_attempts").insert({
          quiz_id: quizId,
          user_id: user.id,
          responses: items.map((_, i) => ({ selected: answers[i] })),
          score_total: correct,
          score_out_of: outOf,
        });
      } catch (_e) {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>AI-Generated Quiz</CardTitle>
            <CardDescription>Create practice MCQs by subject/topic and get instant scoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Subject</Label>
                <Input placeholder="e.g., Mathematics (0580)" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label>Topic (optional)</Label>
                <Input placeholder="e.g., Algebra" value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleGenerate} disabled={loading}>{loading ? "Generating..." : "Generate Quiz"}</Button>
            </div>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {items.map((it, idx) => (
                  <div key={idx} className="border p-4 rounded-lg">
                    <div className="font-medium mb-2">Q{idx + 1}. {it.question}</div>
                    <div className="grid gap-2">
                      {it.options.map((opt, i) => (
                        <label key={i} className={`flex items-center gap-2 p-2 rounded border ${answers[idx] === i ? 'bg-accent/20' : ''}`}>
                          <input
                            type="radio"
                            name={`q_${idx}`}
                            checked={answers[idx] === i}
                            onChange={() => setAnswers((prev) => {
                              const copy = [...prev];
                              copy[idx] = i;
                              return copy;
                            })}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button onClick={handleSubmit}>Submit</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {score && (
          <Card>
            <CardHeader>
              <CardTitle>Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg">{score.total} / {score.outOf}</div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Quiz;