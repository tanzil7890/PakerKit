"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from '../../TemplateEditor';
import { Template } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

export default function TemplateEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isNewTemplate = useRef(true);
  const lastSavedContent = useRef<string>('');
  const currentContent = useRef<string>('');

  const saveTemplate = useCallback(async (content: string) => {
    if (!template) return;
    
    try {
      const contentObj = JSON.parse(content);
      const updatedTemplate = {
        ...template,
        content: JSON.stringify(contentObj),
        lastUpdated: new Date().toISOString()
      };

      const savedTemplates = JSON.parse(localStorage.getItem('templates') || '[]');
      const updatedTemplates = savedTemplates.map((t: Template) => 
        t.id === id ? updatedTemplate : t
      );
      
      localStorage.setItem('templates', JSON.stringify(updatedTemplates));
      setTemplate(updatedTemplate);
      lastSavedContent.current = content;
      setHasUnsavedChanges(false);
      
      return true;
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  }, [template, id]);

  const handleEditorChange = useCallback((content: string) => {
    try {
      JSON.parse(content);
      currentContent.current = content;
      if (content !== lastSavedContent.current) {
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Invalid editor content:', error);
    }
  }, []);

  const handleManualSave = async () => {
    if (!template || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      await saveTemplate(currentContent.current);
      toast({
        title: "Success",
        description: "Changes saved successfully",
      });
      
      if (isNewTemplate.current) {
        router.push('/template');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const savedTemplates = localStorage.getItem('templates');
    if (savedTemplates) {
      const templates = JSON.parse(savedTemplates);
      const currentTemplate = templates.find((t: Template) => t.id === id);
      if (currentTemplate) {
        setTemplate(currentTemplate);
        lastSavedContent.current = currentTemplate.content;
        isNewTemplate.current = false;
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
        isSaving={isSaving}
        isNewTemplate={isNewTemplate.current}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleManualSave}
      />
    </div>
  );
} 