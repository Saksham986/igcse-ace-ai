-- Extensions assumed available (gen_random_uuid)

-- Assessments table to store AI grading results
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('essay','short_answer','quiz')),
  question TEXT,
  answer TEXT,
  score_total NUMERIC,
  score_out_of NUMERIC,
  breakdown JSONB DEFAULT '{}'::jsonb,
  feedback TEXT,
  result_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quizzes table to store generated quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz attempts table to store user answers and scores
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB DEFAULT '[]'::jsonb,
  score_total NUMERIC,
  score_out_of NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Flashcards table for generated flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  topic TEXT,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resource request logs for analytics
CREATE TABLE IF NOT EXISTS public.resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query JSONB NOT NULL,
  results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;

-- Assessments policies
DROP POLICY IF EXISTS "Users can select their assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can insert their assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can update their assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can delete their assessments" ON public.assessments;
CREATE POLICY "Users can select their assessments" ON public.assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their assessments" ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their assessments" ON public.assessments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their assessments" ON public.assessments FOR DELETE USING (auth.uid() = user_id);

-- Quizzes policies
DROP POLICY IF EXISTS "Users can select their quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can insert their quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete their quizzes" ON public.quizzes;
CREATE POLICY "Users can select their quizzes" ON public.quizzes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = user_id);

-- Quiz attempts policies
DROP POLICY IF EXISTS "Users can select their quiz_attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can insert their quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Users can select their quiz_attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their quiz_attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flashcards policies
DROP POLICY IF EXISTS "Users can select their flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can insert their flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can delete their flashcards" ON public.flashcards;
CREATE POLICY "Users can select their flashcards" ON public.flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their flashcards" ON public.flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their flashcards" ON public.flashcards FOR DELETE USING (auth.uid() = user_id);

-- Resource requests policies
DROP POLICY IF EXISTS "Users can select their resource_requests" ON public.resource_requests;
DROP POLICY IF EXISTS "Users can insert their resource_requests" ON public.resource_requests;
CREATE POLICY "Users can select their resource_requests" ON public.resource_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their resource_requests" ON public.resource_requests FOR INSERT WITH CHECK (auth.uid() = user_id);