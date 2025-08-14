import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Assessment {
  id: string;
  subject: string | null;
  assessment_type: string;
  score_total: number | null;
  score_out_of: number | null;
  created_at: string;
}

interface Attempt {
  id: string;
  score_total: number | null;
  score_out_of: number | null;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [plan, setPlan] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: asmt } = await supabase
        .from("assessments")
        .select("id, subject, assessment_type, score_total, score_out_of, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      setAssessments(asmt || []);

      const { data: att } = await supabase
        .from("quiz_attempts")
        .select("id, score_total, score_out_of, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      setAttempts(att || []);
    };
    fetchData();
  }, [user]);

  const recentAverage = (list: { score_total: number | null; score_out_of: number | null }[]) => {
    const valid = list.filter(x => x.score_total != null && x.score_out_of != null && x.score_out_of > 0);
    if (valid.length === 0) return null;
    const percent = valid.reduce((acc, x) => acc + (Number(x.score_total) / Number(x.score_out_of)), 0) / valid.length;
    return Math.round(percent * 100);
  };

  const avgAssess = recentAverage(assessments);
  const avgQuiz = recentAverage(attempts);

  const generatePlan = async () => {
    if (!user) { window.location.href = '/auth'; return; }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('generate-plan', {
        body: {},
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setPlan(data.plan || '');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to generate plan', description: e.message || 'Try again' });
    } finally { setGenerating(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Recent performance across assessments and quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Average Assessment Score</div>
                <div className="text-3xl font-bold">{avgAssess != null ? `${avgAssess}%` : "--"}</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Average Quiz Score</div>
                <div className="text-3xl font-bold">{avgQuiz != null ? `${avgQuiz}%` : "--"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {assessments.map(a => (
                <li key={a.id} className="flex justify-between border rounded p-3">
                  <span>{a.subject || "(no subject)"} • {a.assessment_type}</span>
                  <span>{a.score_total != null && a.score_out_of != null ? `${a.score_total}/${a.score_out_of}` : "--"}</span>
                </li>
              ))}
              {assessments.length === 0 && <li className="text-muted-foreground">No assessments yet.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {attempts.map(a => (
                <li key={a.id} className="flex justify-between border rounded p-3">
                  <span>Attempt</span>
                  <span>{a.score_total != null && a.score_out_of != null ? `${a.score_total}/${a.score_out_of}` : "--"}</span>
                </li>
              ))}
              {attempts.length === 0 && <li className="text-muted-foreground">No quiz attempts yet.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revision Plan</CardTitle>
            <CardDescription>Generate a personalized 4-week plan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generatePlan} disabled={generating}>{generating ? 'Generating...' : 'Generate Plan'}</Button>
            {plan && (
              <div className="prose prose-sm mt-4 whitespace-pre-wrap">{plan}</div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;