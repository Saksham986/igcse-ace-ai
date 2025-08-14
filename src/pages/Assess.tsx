import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Assess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleMark = async () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    if (!subject || !answer) {
      toast({ variant: "destructive", title: "Missing info", description: "Subject and Answer are required" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("mark-essay", {
        body: { subject, question, answer },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Marking failed", description: e.message || "Try again" });
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
            <CardTitle>Essay & Answer Marking</CardTitle>
            <CardDescription>Submit your response for examiner-style feedback and scoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label>Subject</Label>
                <Input placeholder="e.g., English Language, Biology" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label>Question (optional)</Label>
                <Input placeholder="Paste the question prompt" value={question} onChange={(e) => setQuestion(e.target.value)} />
              </div>
              <div>
                <Label>Your Answer</Label>
                <Textarea rows={10} placeholder="Paste or type your answer here" value={answer} onChange={(e) => setAnswer(e.target.value)} />
              </div>
              <div>
                <Button onClick={handleMark} disabled={loading}>{loading ? "Marking..." : "Mark My Work"}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="font-semibold">Overall Score</div>
                  <div>{result.overallScore}/100</div>
                </div>
                {result.breakdown && (
                  <div>
                    <div className="font-semibold">Breakdown</div>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground">
                      {Object.entries(result.breakdown).map(([k, v]) => (
                        <li key={k}>{k}: {String(v)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.comments && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold">Strengths</div>
                      <ul className="list-disc pl-6 text-sm text-muted-foreground">
                        {(result.comments.strengths || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold">Weaknesses</div>
                      <ul className="list-disc pl-6 text-sm text-muted-foreground">
                        {(result.comments.weaknesses || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="md:col-span-2">
                      <div className="font-semibold">Improvements</div>
                      <ul className="list-disc pl-6 text-sm text-muted-foreground">
                        {(result.comments.improvements || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    {result.comments.examinerStyleFeedback && (
                      <div className="md:col-span-2">
                        <div className="font-semibold">Examiner Feedback</div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.comments.examinerStyleFeedback}</p>
                      </div>
                    )}
                  </div>
                )}
                {result.modelAnswer && (
                  <div>
                    <div className="font-semibold">Model Answer</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.modelAnswer}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Assess;