"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, FileDown, Variable } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Dataset } from "@/lib/types";
import type Quill from 'quill';

// Dynamically import Quill editor to avoid SSR issues
const QuillEditor = dynamic(() => import("./QuillEditor"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted/20 animate-pulse rounded-lg" />
});

export default function TemplateEditor() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const editorRef = useRef<Quill | null>(null);

  return (
    <div className="container py-8">
      <div className="grid grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Template Editor</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewMode ? "Edit Mode" : "Preview Mode"}
              </Button>
              <Button>
                <FileDown className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
            </div>
          </div>
          <QuillEditor 
            ref={editorRef} 
            defaultValue={null}
            onTextChange={(delta) => {
              console.log('Content changed:', delta);
            }}
          />
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-sm font-medium mb-4">Variables</h2>
            <div className="space-y-4">
              {selectedDataset?.columns.map((column) => (
                <div
                  key={column.name}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Variable className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{column.name}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {column.type}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 