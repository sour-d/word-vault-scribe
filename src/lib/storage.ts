import { VocabularyEntry, VocabularySection } from "@/types/vocabulary";
import { supabase } from "@/integrations/supabase/client";

// Database-first functions for vocabulary management
export const getSections = async (): Promise<VocabularySection[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage for unauthenticated users
      const sections = localStorage.getItem("vocabulary-sections");
      return sections ? JSON.parse(sections) : [];
    }

    const { data, error } = await supabase
      .from("vocabulary_sections")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((section) => ({
      id: section.id,
      name: section.name,
      createdAt: section.created_at,
    }));
  } catch (error) {
    console.error("Error fetching sections:", error);
    // Fallback to localStorage
    const sections = localStorage.getItem("vocabulary-sections");
    return sections ? JSON.parse(sections) : [];
  }
};

export const createSection = async (
  name: string
): Promise<VocabularySection> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage for unauthenticated users
      const sections = JSON.parse(
        localStorage.getItem("vocabulary-sections") || "[]"
      );
      const newSection: VocabularySection = {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
      };
      sections.push(newSection);
      localStorage.setItem("vocabulary-sections", JSON.stringify(sections));
      return newSection;
    }

    const { data, error } = await supabase
      .from("vocabulary_sections")
      .insert({
        user_id: user.id,
        name,
      })
      .select("id, name, created_at")
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
};

export const getEntries = async (): Promise<VocabularyEntry[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage for unauthenticated users
      const entries = localStorage.getItem("vocabulary-entries");
      return entries ? JSON.parse(entries) : [];
    }

    const { data, error } = await supabase
      .from("vocabulary_entries")
      .select("id, term, meaning, example, section_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((entry) => ({
      id: entry.id,
      term: entry.term,
      meaning: entry.meaning,
      example: entry.example,
      sectionId: entry.section_id,
      createdAt: entry.created_at,
    }));
  } catch (error) {
    console.error("Error fetching entries:", error);
    // Fallback to localStorage
    const entries = localStorage.getItem("vocabulary-entries");
    return entries ? JSON.parse(entries) : [];
  }
};

export const getEntriesBySection = async (
  sectionId: string
): Promise<VocabularyEntry[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage for unauthenticated users
      const entries = JSON.parse(
        localStorage.getItem("vocabulary-entries") || "[]"
      );
      return entries.filter(
        (entry: VocabularyEntry) => entry.sectionId === sectionId
      );
    }

    const { data, error } = await supabase
      .from("vocabulary_entries")
      .select("id, term, meaning, example, section_id, created_at")
      .eq("user_id", user.id)
      .eq("section_id", sectionId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((entry) => ({
      id: entry.id,
      term: entry.term,
      meaning: entry.meaning,
      example: entry.example,
      sectionId: entry.section_id,
      createdAt: entry.created_at,
    }));
  } catch (error) {
    console.error("Error fetching entries by section:", error);
    // Fallback to localStorage
    const entries = JSON.parse(
      localStorage.getItem("vocabulary-entries") || "[]"
    );
    return entries.filter(
      (entry: VocabularyEntry) => entry.sectionId === sectionId
    );
  }
};

export const addEntries = async (
  sectionId: string,
  entriesData: Array<{ term: string; meaning: string; example: string }>
): Promise<VocabularyEntry[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage for unauthenticated users
      const entries = JSON.parse(
        localStorage.getItem("vocabulary-entries") || "[]"
      );
      const newEntries: VocabularyEntry[] = entriesData.map((data) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        term: data.term,
        meaning: data.meaning,
        example: data.example,
        sectionId,
        createdAt: new Date().toISOString(),
      }));

      entries.push(...newEntries);
      localStorage.setItem("vocabulary-entries", JSON.stringify(entries));
      return newEntries;
    }

    const entriesToInsert = entriesData.map((data) => ({
      user_id: user.id,
      section_id: sectionId,
      term: data.term,
      meaning: data.meaning,
      example: data.example,
    }));

    const { data, error } = await supabase
      .from("vocabulary_entries")
      .insert(entriesToInsert)
      .select("id, term, meaning, example, section_id, created_at");

    if (error) throw error;

    return data.map((entry) => ({
      id: entry.id,
      term: entry.term,
      meaning: entry.meaning,
      example: entry.example,
      sectionId: entry.section_id,
      createdAt: entry.created_at,
    }));
  } catch (error) {
    console.error("Error adding entries:", error);
    throw error;
  }
};

// Practice Helper
export const getTodaysSectionIndex = async (): Promise<number> => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const sections = await getSections();
  return sections.length > 0 ? dayOfYear % sections.length : 0;
};
