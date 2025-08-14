import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { message, conversationId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing AI chat request for user:', user.id);

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();
      conversation = data;
    }

    if (!conversation) {
      const { data: newConversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }
      conversation = newConversation;
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: message,
      });

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      throw userMsgError;
    }

    // Get recent conversation history for context
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(10);

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are an expert IGCSE tutor with deep knowledge across all IGCSE subjects including Mathematics, Physics, Chemistry, Biology, English Language, English Literature, History, Geography, Computer Science, and more. 

Your role is to:
- Provide clear, accurate explanations tailored to IGCSE level (ages 14-16)
- Break down complex concepts into digestible parts
- Offer step-by-step solutions for problems
- Provide exam tips and study strategies
- Help with past paper questions and practice
- Encourage and motivate students
- Adapt your teaching style to individual needs

Always be encouraging, patient, and supportive. If a question is unclear, ask for clarification. For mathematical problems, show your working clearly. For essay subjects, provide structure and examples.`
      },
      ...(recentMessages || []).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        max_completion_tokens: 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save AI response
    const { error: aiMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: aiResponse,
      });

    if (aiMsgError) {
      console.error('Error saving AI message:', aiMsgError);
      throw aiMsgError;
    }

    console.log('AI chat response generated successfully');

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversationId: conversation.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});