"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import CreateTemplateDialog from "./CreateTemplateDialog";
import type { Variable, Template } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, FileText, Clock, BarChart, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function Template() {
  const router = useRouter();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    paperSize: "a4"
  });

  useEffect(() => {
    const savedTemplates = localStorage.getItem('templates');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(parsed);
      } catch (error) {
        console.error('Error parsing templates:', error);
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    const template: Template = {
      id: crypto.randomUUID(),
      name: newTemplate.name,
      description: newTemplate.description,
      paperSize: newTemplate.paperSize as Template['paperSize'],
      size: 'A4',
      lastUpdated: new Date().toISOString(),
      content: JSON.stringify({
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "",
                  type: "text",
                  version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1
        }
      }),
      variables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      documentsGenerated: 0
    };

    const updatedTemplates = [...templates, template];
    setTemplates(updatedTemplates);
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    
    setShowCreateDialog(false);
    setNewTemplate({ name: "", description: "", paperSize: "a4" });
    
    toast({
      title: "Success",
      description: "Template created successfully",
    });

    router.push(`/template/editor/${template.id}`);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => {
      const filtered = prev.filter(t => t.id !== id);
      localStorage.setItem('templates', JSON.stringify(filtered));
      return filtered;
    });
    
    toast({
      title: "Success",
      description: "Template deleted successfully",
    });
  };

  const handleTemplateClick = (template: Template) => {
    const now = new Date();
    const updatedTemplate = {
      ...template,
      lastUsed: now
    };

    const updatedTemplates = templates.map(t => 
      t.id === template.id ? updatedTemplate : t
    );
    
    setTemplates(updatedTemplates);
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    
    router.push(`/template/editor/${template.id}`);
  };

  return (
    <div className="container py-24 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Create and manage your document templates</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="shadow-lg hover:shadow-primary/25 transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Set up your template details. You can customize the content in the editor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Invoice Template"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this template..."
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paper-size">Paper Size</Label>
                <Select
                  value={newTemplate.paperSize}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, paperSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a paper size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="letter">Letter (8.5&quot; × 11&quot;)</SelectItem>
                    <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="legal">Legal (8.5&quot; × 14&quot;)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
              onClick={() => handleTemplateClick(template)}
            />
            <CardHeader>
              <div className="flex items-center justify-between relative z-10">
                <CardTitle 
                  className="group-hover:text-primary transition-colors cursor-pointer"
                  onClick={() => handleTemplateClick(template)}
                >
                  {template.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-destructive/10 hover:text-destructive z-20"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this template?')) {
                      handleDeleteTemplate(template.id);
                    }
                  }}
                  aria-label="Delete template"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent 
              className="cursor-pointer"
              onClick={() => handleTemplateClick(template)}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-primary/70" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {template.lastUsed 
                          ? `Last used ${formatDistanceToNow(template.lastUsed)} ago`
                          : 'Never used'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Generated {template.documentsGenerated || 0} documents
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}