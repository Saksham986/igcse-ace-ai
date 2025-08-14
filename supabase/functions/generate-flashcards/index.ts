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

    const { subject, topic, sourceText, numCards = 12 } = await req.json();
    if (!subject && !sourceText) throw new Error("Provide subject or sourceText");

    const system = {
      role: "system",
      content: `You are an expert IGCSE tutor. Generate high-yield flashcards for revision.
Return a STRICT JSON: { "cards": { "front": string, "back": string }[] }.
Keep fronts concise (question/term), backs brief but complete, syllabus-accurate.`
    };

    const userMsg = {
      role: "user",
      content: JSON.stringify({ subject: subject ?? null, topic: topic ?? null, sourceText: sourceText ?? null, numCards })
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
        max_completion_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let parsed: any;
    try {
      parsed = JSON.parse(data.choices[0].message.content);
    } catch (_e) {
      parsed = data.choices[0].message.content;
    }

    const cards: { front: string; back: string }[] = parsed?.cards ?? [];

    // Persist
    if (cards.length > 0) {
      const rows = cards.map((c) => ({
        user_id: user.id,
        subject: subject ?? null,
        topic: topic ?? null,
        front: c.front,
        back: c.back,
      }));
      const { error: insertErr } = await supabase.from("flashcards").insert(rows);
      if (insertErr) console.error("Error saving flashcards:", insertErr);
    }

    return new Response(
      JSON.stringify({ cards }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in generate-flashcards function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});