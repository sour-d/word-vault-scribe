import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSections, getEntriesBySection } from '@/lib/storage';
import { VocabularySection, VocabularyEntry } from '@/types/vocabulary';
import { ArrowLeft, BookOpen, Calendar, Hash } from 'lucide-react';

export const SectionDetail = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [section, setSection] = useState<VocabularySection | null>(null);
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sectionId) return;

    const loadSection = async () => {
      const sections = await getSections();
      const currentSection = sections.find(s => s.id === sectionId);
      const sectionEntries = await getEntriesBySection(sectionId);
      
      setSection(currentSection || null);
      setEntries(sectionEntries);
      setLoading(false);
    };

    loadSection();
  }, [sectionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading section...</p>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Section Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The section you're looking for doesn't exist.
            </p>
            <Link to="/sections">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Sections
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/sections">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Sections
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-card-foreground mb-2">{section.name}</h1>
          <div className="flex items-center space-x-4 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Created {new Date(section.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>{entries.length} entries</span>
            </div>
          </div>
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                No Entries Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                This section is empty. Add some vocabulary entries to get started.
              </p>
              <Link to="/add">
                <Button variant="secondary">
                  Add Entries to This Section
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {entries
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((entry, index) => (
              <Card key={entry.id} className="shadow-card hover:shadow-focus transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-card-foreground">
                      {entry.term}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      #{entries.length - index}
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
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Section Summary */}
        {entries.length > 0 && (
          <Card className="mt-8 bg-gradient-learning border-secondary">
            <CardContent className="text-center py-6">
              <div className="flex justify-center items-center space-x-6 text-secondary-foreground">
                <div>
                  <div className="text-2xl font-bold">{entries.length}</div>
                  <div className="text-sm opacity-90">Total Entries</div>
                </div>
                <div className="w-px h-12 bg-secondary-foreground/20"></div>
                <div>
                  <div className="text-2xl font-bold">{section.name}</div>
                  <div className="text-sm opacity-90">Section Name</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};