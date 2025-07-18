-- Create vocabulary sections table
CREATE TABLE public.vocabulary_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vocabulary entries table
CREATE TABLE public.vocabulary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section_id UUID NOT NULL REFERENCES public.vocabulary_sections(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vocabulary_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for vocabulary_sections
CREATE POLICY "Users can view their own sections" 
ON public.vocabulary_sections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sections" 
ON public.vocabulary_sections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sections" 
ON public.vocabulary_sections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sections" 
ON public.vocabulary_sections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for vocabulary_entries
CREATE POLICY "Users can view their own entries" 
ON public.vocabulary_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" 
ON public.vocabulary_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.vocabulary_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.vocabulary_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_vocabulary_sections_updated_at
BEFORE UPDATE ON public.vocabulary_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vocabulary_entries_updated_at
BEFORE UPDATE ON public.vocabulary_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_vocabulary_sections_user_id ON public.vocabulary_sections(user_id);
CREATE INDEX idx_vocabulary_entries_user_id ON public.vocabulary_entries(user_id);
CREATE INDEX idx_vocabulary_entries_section_id ON public.vocabulary_entries(section_id);