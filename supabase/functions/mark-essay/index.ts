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

    const { question, answer, subject, criteria } = await req.json();
    if (!answer || !subject) throw new Error("Missing required fields: answer, subject");

    const gradingPrompt = {
      role: "system",
      content: `You are an expert Cambridge IGCSE examiner. Grade student responses using authentic IGCSE marking approaches.
Return a STRICT JSON object with these keys:
{
  "overallScore": number,               // 0-100
  "breakdown": {
    "content": number,                  // 0-25
    "structure": number,                // 0-25
    "vocabulary": number,               // 0-25
    "accuracy": number                  // 0-25
  },
  "comments": {
    "strengths": string[],
    "weaknesses": string[],
    "improvements": string[],
    "examinerStyleFeedback": string
  },
  "modelAnswer": string
}
Ensure the model answer is syllabus-accurate for the subject.
If a question is provided, consider it strictly. If criteria are provided, align weighting accordingly.`
    };

    const userMessage = {
      role: "user",
      content: JSON.stringify({ subject, question: question ?? null, answer, criteria: criteria ?? null })
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [gradingPrompt, userMessage],
        max_completion_tokens: 900,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let resultJson: any;
    try {
      resultJson = JSON.parse(data.choices[0].message.content);
    } catch (_e) {
      // If JSON mode still returns as object
      resultJson = data.choices[0].message.content;
    }

    const overallScore = Number(resultJson?.overallScore ?? null);
    const breakdown = resultJson?.breakdown ?? {};
    const examinerFeedback = resultJson?.comments?.examinerStyleFeedback ?? "";

    // Persist assessment
    const { error: insertErr } = await supabase
      .from("assessments")
      .insert({
        user_id: user.id,
        subject,
        assessment_type: "essay",
        question: question ?? null,
        answer,
        score_total: isFinite(overallScore) ? overallScore : null,
        score_out_of: 100,
        breakdown: breakdown,
        feedback: examinerFeedback,
        result_json: resultJson,
      });

    if (insertErr) {
      console.error("Error saving assessment:", insertErr);
      // continue, still return the result
    }

    return new Response(
      JSON.stringify({ success: true, result: resultJson }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in mark-essay function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});