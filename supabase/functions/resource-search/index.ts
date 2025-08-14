import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { subject, year, session, paper } = await req.json();

    const s = String(subject || "").trim();
    const y = year ? String(year) : "";
    const sess = String(session || "").trim();
    const p = String(paper || "").trim();

    const queryParts = ["IGCSE", s, y, sess, p].filter(Boolean).join(" ");

    const searchLinks = [
      {
        title: "Google search (GCE Guide)",
        url: `https://www.google.com/search?q=${encodeURIComponent(queryParts + " site:gceguide.com")}`,
      },
      {
        title: "Google search (PapaCambridge)",
        url: `https://www.google.com/search?q=${encodeURIComponent(queryParts + " site:papacamb.com")}`,
      },
      {
        title: "Google search (Xtremepape.rs)",
        url: `https://www.google.com/search?q=${encodeURIComponent(queryParts + " site:xtremepape.rs")}`,
      },
      {
        title: "GCE Guide subject directory (guess)",
        url: `https://papers.gceguide.com/Cambridge%20IGCSE/${encodeURIComponent(s)}/`,
      },
    ];

    const suggestions = [
      "Use the subject code if known (e.g., 0625 Physics, 0580 Mathematics)",
      "Try Paper 1/2/3/4 and session terms like 'May June' or 'Oct Nov'",
      "Look for 'QP' (Question Paper), 'MS' (Mark Scheme), 'ER' (Examiner Report)"
    ];

    // Log the request
    await supabase.from("resource_requests").insert({
      user_id: user.id,
      query: { subject: s, year: y, session: sess, paper: p },
      results: searchLinks,
    });

    return new Response(
      JSON.stringify({ results: searchLinks, suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in resource-search function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});