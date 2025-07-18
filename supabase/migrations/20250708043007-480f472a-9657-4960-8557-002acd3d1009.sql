-- Create table to track section practice sessions
CREATE TABLE public.section_practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section_id TEXT NOT NULL,
  section_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cycle_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.section_practice_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own practice sessions" 
ON public.section_practice_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own practice sessions" 
ON public.section_practice_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice sessions" 
ON public.section_practice_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practice sessions" 
ON public.section_practice_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance on queries
CREATE INDEX idx_section_practice_sessions_user_cycle ON public.section_practice_sessions(user_id, cycle_number);
CREATE INDEX idx_section_practice_sessions_user_completed ON public.section_practice_sessions(user_id, completed_at DESC);