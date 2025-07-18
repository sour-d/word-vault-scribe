import { useState, useEffect } from 'react';
import { getSections, getEntriesBySection } from '@/lib/storage';
import { VocabularySection, VocabularyEntry } from '@/types/vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Target, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const Practice = () => {
  const [currentSection, setCurrentSection] = useState<VocabularySection | null>(null);
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingSection, setChangingSection] = useState(false);
  const { toast } = useToast();

  const getUnshownSections = async (): Promise<VocabularySection[]> => {
    const allSections = await getSections();
    if (allSections.length === 0) return [];

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return allSections; // If not authenticated, return all sections

    // Get current cycle number
    const { data: latestSession } = await supabase
      .from('section_practice_sessions')
      .select('cycle_number')
      .eq('user_id', user.user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentCycle = latestSession?.cycle_number || 1;

    // Get sections already shown in current cycle
    const { data: completedSessions } = await supabase
      .from('section_practice_sessions')
      .select('section_id')
      .eq('user_id', user.user.id)
      .eq('cycle_number', currentCycle);

    const completedSectionIds = completedSessions?.map(s => s.section_id) || [];
    
    // Filter out completed sections
    const unshownSections = allSections.filter(section => 
      !completedSectionIds.includes(section.id)
    );

    return unshownSections;
  };

  const getRandomSection = async (): Promise<VocabularySection | null> => {
    const unshownSections = await getUnshownSections();
    
    if (unshownSections.length === 0) {
      // All sections completed, start new cycle
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await startNewCycle();
      }
      const allSections = await getSections();
      if (allSections.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * allSections.length);
      return allSections[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * unshownSections.length);
    return unshownSections[randomIndex];
  };

  const startNewCycle = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    // Get current cycle number and increment
    const { data: latestSession } = await supabase
      .from('section_practice_sessions')
      .select('cycle_number')
      .eq('user_id', user.user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newCycleNumber = (latestSession?.cycle_number || 0) + 1;
    
    toast({
      title: "New Cycle Started!",
      description: `Starting cycle ${newCycleNumber}. All sections are available again.`,
    });
  };

  const markSectionComplete = async (section: VocabularySection) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your progress.",
        variant: "destructive",
      });
      return;
    }

    // Get current cycle number
    const { data: latestSession } = await supabase
      .from('section_practice_sessions')
      .select('cycle_number')
      .eq('user_id', user.user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentCycle = latestSession?.cycle_number || 1;

    // Record completion
    const { error } = await supabase
      .from('section_practice_sessions')
      .insert({
        user_id: user.user.id,
        section_id: section.id,
        section_name: section.name,
        cycle_number: currentCycle,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to record section completion.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Section Completed!",
      description: `"${section.name}" has been marked as complete.`,
    });

    // Load next section automatically
    await loadRandomSection();
  };

  const loadRandomSection = async () => {
    setChangingSection(true);
    const section = await getRandomSection();
    
    if (section) {
      const sectionEntries = await getEntriesBySection(section.id);
      setCurrentSection(section);
      setEntries(sectionEntries);
    } else {
      setCurrentSection(null);
      setEntries([]);
    }
    setChangingSection(false);
  };

  useEffect(() => {
    const loadInitialSection = async () => {
      setLoading(true);
      await loadRandomSection();
      setLoading(false);
    };

    loadInitialSection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-card-foreground mb-4">No Sections Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first vocabulary section to start practicing!
            </p>
            <a href="/add" className="text-primary hover:underline">
              Add your first words →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 text-primary" />
            <span className="text-muted-foreground">{today}</span>
          </div>
          <h1 className="text-3xl font-bold text-card-foreground mb-2">Practice Session</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                Section: {currentSection.name}
              </Badge>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>{entries.length} words to review</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => markSectionComplete(currentSection)}
                className="bg-gradient-learning text-secondary-foreground hover:opacity-90"
                disabled={changingSection}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Section
              </Button>
              <Button
                variant="outline"
                onClick={loadRandomSection}
                disabled={changingSection}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${changingSection ? 'animate-spin' : ''}`} />
                Change Section
              </Button>
            </div>
          </div>
        </div>

        {/* Vocabulary Cards */}
        {entries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Section "{currentSection.name}" is Empty
              </h3>
              <p className="text-muted-foreground">
                Add some vocabulary entries to this section to start practicing.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <Card key={entry.id} className="shadow-card hover:shadow-focus transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-card-foreground">
                      {entry.term}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-muted-foreground text-sm uppercase tracking-wide font-medium mb-1">
                      Definition
                    </p>
                    <p className="text-card-foreground italic text-lg">
                      {entry.meaning}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm uppercase tracking-wide font-medium mb-1">
                      Example
                    </p>
                    <p className="text-card-foreground">
                      "{entry.example}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Practice Stats */}
        {entries.length > 0 && (
          <Card className="mt-8 bg-gradient-learning border-secondary">
            <CardContent className="text-center py-6">
              <div className="flex justify-center items-center space-x-6 text-secondary-foreground">
                <div>
                  <div className="text-2xl font-bold">{entries.length}</div>
                  <div className="text-sm opacity-90">Words Today</div>
                </div>
                <div className="w-px h-12 bg-secondary-foreground/20"></div>
                <div>
                  <div className="text-2xl font-bold">{currentSection.name}</div>
                  <div className="text-sm opacity-90">Current Section</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};