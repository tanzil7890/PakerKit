"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Editor from '../../TemplateEditor';
import { Variable, Template } from '@/lib/types';
import debounce from 'lodash/debounce';

export default function TemplateEditorPage() {
  const { id } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((content: string) => {
      if (!template) return;

      const updatedTemplate = {
        ...template,
        content,
        lastUpdated: new Date().toISOString()
      };

      const savedTemplates = JSON.parse(localStorage.getItem('templates') || '[]');
      const updatedTemplates = savedTemplates.map((t: Template) => 
        t.id === id ? updatedTemplate : t
      );
      
      localStorage.setItem('templates', JSON.stringify(updatedTemplates));
      setTemplate(updatedTemplate);
    }, 1000),
    [template, id]
  );

  const handleEditorChange = (content: string) => {
    debouncedSave(content);
  };

  useEffect(() => {
    const savedTemplates = localStorage.getItem('templates');
    if (savedTemplates) {
      const templates = JSON.parse(savedTemplates);
      const currentTemplate = templates.find((t: Template) => t.id === id);
      if (currentTemplate) {
        setTemplate(currentTemplate);
      }
    }
  }, [id]);

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <Editor 
        content={template.content}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
} 