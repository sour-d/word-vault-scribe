import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSections, createSection, addEntries } from '@/lib/storage';
import { VocabularySection } from '@/types/vocabulary';
import { toast } from 'sonner';
import { Plus, BookOpen, Save } from 'lucide-react';

export const AddVocabulary = () => {
  const [sections, setSections] = useState<VocabularySection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [newSectionName, setNewSectionName] = useState('');
  const [vocabText, setVocabText] = useState('');
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSections = async () => {
      const sections = await getSections();
      setSections(sections);
    };
    loadSections();
  }, []);

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      toast.error('Please enter a section name');
      return;
    }

    const existingSection = sections.find(s => s.name.toLowerCase() === newSectionName.trim().toLowerCase());
    if (existingSection) {
      toast.error('A section with this name already exists');
      return;
    }

    try {
      const newSection = await createSection(newSectionName.trim());
      setSections([...sections, newSection]);
      setSelectedSection(newSection.id);
      setNewSectionName('');
      setIsCreatingSection(false);
      toast.success(`Section "${newSection.name}" created successfully`);
    } catch (error) {
      toast.error('Failed to create section');
    }
  };

  const parseVocabularyText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const entries = [];

    for (const line of lines) {
      const parts = line.split('|').map(part => part.trim());
      if (parts.length === 3) {
        entries.push({
          term: parts[0],
          meaning: parts[1],
          example: parts[2]
        });
      }
    }

    return entries;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedSection) {
        toast.error('Please select a section');
        return;
      }

      if (!vocabText.trim()) {
        toast.error('Please enter vocabulary entries');
        return;
      }

      const entries = parseVocabularyText(vocabText);
      
      if (entries.length === 0) {
        toast.error('No valid entries found. Please use format: term | meaning | example');
        return;
      }

      await addEntries(selectedSection, entries);
      
      const sectionName = sections.find(s => s.id === selectedSection)?.name;
      toast.success(`Added ${entries.length} entries to "${sectionName}"`);
      
      setVocabText('');
    } catch (error) {
      toast.error('Failed to add vocabulary entries');
    } finally {
      setLoading(false);
    }
  };

  const exampleText = `In hot water | in trouble | He's in hot water after missing the deadline
Scorching | very hot | It's scorching hot today  
Piece of cake | very easy | That test was a piece of cake`;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2">Add Vocabulary</h1>
          <p className="text-muted-foreground">
            Add new words, phrases, and idioms to your vocabulary collection
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Section Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Choose Section</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCreatingSection ? (
                <>
                  <div className="space-y-2">
                    <Label>Select existing section</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a section..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map(section => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground text-sm">or</span>
                  </div>
                  <Button 
                    onClick={() => setIsCreatingSection(true)}
                    variant="outline" 
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Section
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newSection">New section name</Label>
                    <Input
                      id="newSection"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="e.g., Phrasal Verbs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateSection();
                        }
                      }}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateSection} className="flex-1">
                      Create Section
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsCreatingSection(false);
                        setNewSectionName('');
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {sections.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Existing sections:</p>
                  <div className="flex flex-wrap gap-2">
                    {sections.map(section => (
                      <span key={section.id} className="text-xs px-2 py-1 bg-muted rounded">
                        {section.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Format Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Format Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Use this format for each entry (one per line):
                </p>
                <div className="bg-muted p-3 rounded-md text-sm font-mono">
                  term | meaning | example
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Example:</p>
                  <pre className="text-xs bg-secondary-light p-3 rounded text-secondary whitespace-pre-wrap">
                    {exampleText}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vocabulary Input */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add Vocabulary Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vocab">Vocabulary entries</Label>
                <Textarea
                  id="vocab"
                  value={vocabText}
                  onChange={(e) => setVocabText(e.target.value)}
                  placeholder={exampleText}
                  className="min-h-48 font-mono text-sm"
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {vocabText ? parseVocabularyText(vocabText).length : 0} valid entries detected
                </p>
                <Button 
                  type="submit" 
                  disabled={loading || !selectedSection}
                  variant="secondary"
                >
                  {loading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Add Entries
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};