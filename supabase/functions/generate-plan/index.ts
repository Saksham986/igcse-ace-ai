import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch recent data
    const { data: assessments } = await supabase
      .from("assessments")
      .select("subject, assessment_type, score_total, score_out_of, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("score_total, score_out_of, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, preferred_subjects")
      .eq("user_id", user.id)
      .single();

    const system = {
      role: "system",
      content: `You are a seasoned IGCSE academic coach. Create a realistic, week-by-week 4-week revision plan tailored to the student, using their recent performance and preferences.
Output Markdown only. Include:
- Priority topics (by subject) with rationale
- Weekly schedule (per day) with time estimates
- Specific practice (past paper codes if applicable)
- Checkpoints and self-assessment criteria
- Tips for exam technique and common pitfalls`
    };

    const userMsg = {
      role: "user",
      content: JSON.stringify({ profile: profile ?? {}, assessments: assessments ?? [], attempts: attempts ?? [] })
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [system, userMsg],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const plan = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ plan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in generate-plan function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});