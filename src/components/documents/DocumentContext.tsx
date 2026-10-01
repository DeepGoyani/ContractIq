"use client"
import React, { createContext, useContext, useState, ReactNode } from "react";

interface DocumentContextType {
  activeCitation: { text: string; pageNumber?: number } | null;
  setActiveCitation: (citation: { text: string; pageNumber?: number } | null) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [activeCitation, setActiveCitation] = useState<{ text: string; pageNumber?: number } | null>(null);

  return (
    <DocumentContext.Provider value={{ activeCitation, setActiveCitation }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocumentContext must be used within a DocumentProvider");
  }
  return context;
}
