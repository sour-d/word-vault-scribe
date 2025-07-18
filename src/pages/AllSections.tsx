import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSections, getEntriesBySection } from '@/lib/storage';
import { VocabularySection } from '@/types/vocabulary';
import { Search, FolderOpen, BookOpen } from 'lucide-react';

export const AllSections = () => {
  const [sections, setSections] = useState<VocabularySection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSections = async () => {
      const allSections = await getSections();
      // Add entry count to each section
      const sectionsWithCount = await Promise.all(
        allSections.map(async section => {
          const entries = await getEntriesBySection(section.id);
          return {
            ...section,
            entryCount: entries.length
          };
        })
      );
      setSections(sectionsWithCount);
      setLoading(false);
    };

    loadSections();
  }, []);

  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2">All Sections</h1>
          <p className="text-muted-foreground">
            Browse and manage your vocabulary sections
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sections Grid */}
        {sections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-card-foreground mb-4">No Sections Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first vocabulary section to start organizing your English learning journey.
              </p>
              <Link 
                to="/add" 
                className="inline-flex items-center px-4 py-2 bg-gradient-primary text-primary-foreground rounded-md hover:shadow-focus transition-all duration-300"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Add Your First Section
              </Link>
            </CardContent>
          </Card>
        ) : filteredSections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">No sections found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search term or create a new section.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSections.map((section) => (
                <Link key={section.id} to={`/section/${section.id}`}>
                  <Card className="hover:shadow-focus transition-all duration-300 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {section.name}
                        </CardTitle>
                        <FolderOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant={section.entryCount === 0 ? "outline" : "secondary"}>
                          {section.entryCount} {section.entryCount === 1 ? 'entry' : 'entries'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(section.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Summary Stats */}
            <Card className="mt-8 bg-gradient-learning border-secondary">
              <CardContent className="py-6">
                <div className="flex justify-center items-center space-x-8 text-secondary-foreground">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{sections.length}</div>
                    <div className="text-sm opacity-90">Total Sections</div>
                  </div>
                  <div className="w-px h-16 bg-secondary-foreground/20"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {sections.reduce((total, section) => total + (section.entryCount || 0), 0)}
                    </div>
                    <div className="text-sm opacity-90">Total Entries</div>
                  </div>
                  <div className="w-px h-16 bg-secondary-foreground/20"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {sections.filter(s => (s.entryCount || 0) > 0).length}
                    </div>
                    <div className="text-sm opacity-90">Active Sections</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};