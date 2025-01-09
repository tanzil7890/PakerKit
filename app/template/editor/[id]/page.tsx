"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Variable, ArrowLeft, Save, Plus, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Template } from "@/lib/types";
import type { Delta } from "quill";
import { useToast } from "@/hooks/use-toast";
import Quill from "quill";

const QuillEditor = dynamic(() => import("../QuillEditor"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted/20 animate-pulse rounded-lg" />
});

export default function TemplateEditor() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const editorRef = useRef<Quill | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState("");

  useEffect(() => {
    const savedTemplates = JSON.parse(localStorage.getItem('templates') || '[]');
    const foundTemplate = savedTemplates.find((t: Template) => t.id === id);
    if (foundTemplate) {
      setTemplate(foundTemplate);
      if (editorRef.current) {
        editorRef.current.setContents(foundTemplate.content || { ops: [] });
      }
    }
  }, [id]);

  const handleTextChange = useCallback((delta: Delta) => {
    setHasUnsavedChanges(true);
    if (template) {
      setTemplate(prev => prev ? {
        ...prev,
        content: delta,
        updatedAt: new Date()
      } : null);
    }
  }, [template]);

  const handleAddVariable = () => {
    if (!newVariable.trim()) return;
    setVariables(prev => [...prev, newVariable.trim()]);
    setNewVariable("");
  };

  const insertVariable = (variableName: string) => {
    if (!editorRef.current) return;
    const range = editorRef.current.getSelection(true);
    editorRef.current.insertText(range.index, `{{${variableName}}}`, {
      color: '#2563eb',
      bold: true
    });
    editorRef.current.setSelection(range.index + variableName.length + 4);
  };

  const handleSave = () => {
    if (!template || !editorRef.current) return;

    const now = new Date();
    const currentContent = editorRef.current.getContents();
    
    const updatedTemplate = {
      ...template,
      updatedAt: now,
      lastUsed: now,
      content: currentContent,
      variables: variables
    };

    const savedTemplates = JSON.parse(localStorage.getItem('templates') || '[]');
    const updatedTemplates = savedTemplates.map((t: Template) => 
      t.id === id ? updatedTemplate : t
    );
    
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    setTemplate(updatedTemplate);
    setHasUnsavedChanges(false);
    
    toast({
      title: "Success",
      description: "Template saved successfully",
    });
    
    router.push('/template');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      const lines = text.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      
      // Add headers as variables
      setVariables(prev => {
        const newVars = [...prev];
        headers.forEach(header => {
          if (!newVars.includes(header)) {
            newVars.push(header);
          }
        });
        return newVars;
      });

      toast({
        title: "Success",
        description: `Imported ${headers.length} variables from CSV`,
      });
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editorRef.current) return;
    
    const variable = e.dataTransfer.getData('text/plain');
    const range = editorRef.current.getSelection(true);
    
    editorRef.current.insertText(range.index, `{{${variable}}}`, {
      'variable': variable,
      'color': '#2563eb',
      'bold': true
    });
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/template">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-8">
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <QuillEditor 
            ref={editorRef} 
            defaultValue={template.content || null}
            onTextChange={handleTextChange}
          />
        </div>
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-sm font-medium mb-4">Variables</h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                placeholder="Add variable..."
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddVariable}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">
                Import from CSV
              </label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              {variables.map((variable) => (
                <Badge
                  key={variable}
                  className="mr-2 mb-2 cursor-move"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', variable);
                  }}
                  onClick={() => insertVariable(variable)}
                >
                  {variable}
                </Badge>
              ))}
              {variables.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No variables added yet. Add manually or import from CSV.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 