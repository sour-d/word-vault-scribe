import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Navigation } from "@/components/Navigation";
import { Practice } from "@/pages/Practice";
import { AddVocabulary } from "@/pages/AddVocabulary";
import { AllSections } from "@/pages/AllSections";
import { SectionDetail } from "@/pages/SectionDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGuard>
          <Navigation />
          <Routes>
            <Route path="/" element={<Practice />} />
            <Route path="/add" element={<AddVocabulary />} />
            <Route path="/sections" element={<AllSections />} />
            <Route path="/section/:sectionId" element={<SectionDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
