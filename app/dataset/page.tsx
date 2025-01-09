"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Plus, FileSpreadsheet, Clock, RefreshCw, X, Table, ChevronDown, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import type { Dataset, FileWithPreview } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const SAMPLE_DATASET: Dataset = {
  id: "sample-001",
  name: "sample_customer_data.csv",
  records: 1000,
  uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  type: "csv",
  columns: [
    { name: "customer_id", type: "text", sample: "CUS-001" },
    { name: "full_name", type: "text", sample: "John Doe" },
    { name: "email", type: "text", sample: "john.doe@example.com" },
    { name: "age", type: "number", sample: "32" },
    { name: "subscription_date", type: "date", sample: "2024-01-15" },
    { name: "total_orders", type: "number", sample: "15" },
    { name: "lifetime_value", type: "number", sample: "2450.75" },
    { name: "last_purchase", type: "date", sample: "2024-03-01" }
  ],
  statistics: {
    columnCount: 8,
    rowCount: 1000,
    dataType: "tabular",
    format: "csv"
  },
  data: [],
  preview: []
};

export default function Dataset() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<{
    datasetId: string;
    columns: Dataset['columns'];
  } | null>(null);
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const detectColumnType = (value: string): string => {
    if (!isNaN(Date.parse(value))) return 'date';
    if (!isNaN(Number(value))) return 'number';
    return 'text';
  };

  const detectDatasetType = (columns: Dataset['columns'], data: any[]): Dataset['statistics'] => {
    const columnCount = columns.length;
    const rowCount = data.length;
    
    // Analyze column types to determine dataset type
    const types = columns.map(col => col.type);
    const hasDate = types.includes('date');
    const numericColumns = types.filter(t => t === 'number').length;
    const categoricalColumns = types.filter(t => t === 'text').length;
    
    let dataType: Dataset['statistics']['dataType'] = 'tabular';
    if (hasDate && numericColumns > 0) {
      dataType = 'time-series';
    } else if (numericColumns > categoricalColumns) {
      dataType = 'numerical';
    } else if (categoricalColumns > numericColumns) {
      dataType = 'categorical';
    }

    return {
      columnCount,
      rowCount,
      dataType,
      format: 'csv'
    };
  };

  const handleFileDrop = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const file = files[0];
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "Error parsing CSV",
            description: "The CSV file contains errors",
            variant: "destructive",
          });
          return;
        }

        const data = results.data as Record<string, any>[];
        const columnNames = results.meta.fields || [];
        const columns = columnNames.map(name => ({
          name,
          type: detectColumnType(data[0]?.[name]),
          sample: data[0]?.[name]
        }));

        const statistics = detectDatasetType(columns, data);

        const newDataset: Dataset = {
          id: crypto.randomUUID(),
          name: file.name,
          records: data.length,
          uploadedAt: new Date(),
          type: 'csv',
          data,
          columns,
          preview: data.slice(0, 5),
          statistics
        };

        setDatasets((prev) => [newDataset, ...prev]);
        toast({
          title: "Dataset uploaded",
          description: `Successfully uploaded ${file.name} with ${columns.length} variables`,
        });
      },
      header: true,
      skipEmptyLines: true,
    });
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileDrop(e.dataTransfer.files);
  }, [handleFileDrop]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileDrop(e.target.files);
  }, [handleFileDrop]);

  const removeDataset = useCallback((id: string) => {
    setDatasets((prev) => prev.filter((dataset) => dataset.id !== id));
    toast({
      title: "Dataset removed",
      description: "The dataset has been removed successfully",
    });
  }, [toast]);

  const handleBadgeClick = useCallback((datasetId: string, column: Dataset['columns'][0]) => {
    setSelectedColumns({
      datasetId,
      columns: [column]
    });
  }, []);

  const handleShowMore = useCallback((datasetId: string, columns: Dataset['columns']) => {
    setSelectedColumns({
      datasetId,
      columns
    });
  }, []);

  return (
    <div className="container py-24 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
          <p className="text-muted-foreground">Manage your data sources for document generation</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="shadow-lg hover:shadow-primary/25 transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Dataset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload New Dataset</DialogTitle>
              <DialogDescription>Import data from CSV files to create a new dataset</DialogDescription>
            </DialogHeader>
            <Card className={cn(
              "border-0 shadow-none",
              isDragging && "ring-2 ring-primary ring-offset-2"
            )}>
              <CardContent className="pt-4">
                <div
                  className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors group cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    handleDrop(e);
                    setShowUploadDialog(false);
                  }}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={(e) => {
                      handleFileInput(e);
                      setShowUploadDialog(false);
                    }}
                  />
                  <Upload className={cn(
                    "h-10 w-10 mb-4 transition-colors",
                    isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )} />
                  <p className="text-sm text-muted-foreground text-center group-hover:text-foreground transition-colors">
                    {isDragging ? "Drop your CSV file here" : "Drag and drop your CSV file here, or click to browse"}
                  </p>
                  <Button variant="outline" className="mt-4">Browse Files</Button>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {datasets.length === 0 ? (
          <>
            <Card className="relative border-dashed border-2 bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Example Dataset</CardTitle>
                <CardDescription className="text-xs">
                  This is how your datasets will appear after upload
                </CardDescription>
              </CardHeader>
            </Card>
            <Card key={SAMPLE_DATASET.id} className="relative group hover:shadow-lg overflow-hidden transition-all opacity-75">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                    {SAMPLE_DATASET.name}
                    <Badge variant="secondary" className="ml-2 text-xs">Example</Badge>
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-2">
                    <span className="capitalize">{SAMPLE_DATASET.statistics.dataType} Dataset</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{SAMPLE_DATASET.statistics.columnCount} columns</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{SAMPLE_DATASET.statistics.rowCount.toLocaleString()} rows</span>
                  </CardDescription>
                </div>
              </CardHeader>
              {/* Rest of the card content remains the same as your existing dataset card */}
            </Card>
          </>
        ) : (
          datasets.map((dataset) => (
            <Card key={dataset.id} className="relative group hover:shadow-lg overflow-hidden transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                    {dataset.name}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-2">
                    <span className="capitalize">{dataset.statistics.dataType} Dataset</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{dataset.statistics.columnCount} columns</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{dataset.statistics.rowCount.toLocaleString()} rows</span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors absolute top-4 right-4 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDataset(dataset.id);
                  }}
                  aria-label="Remove dataset"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              

              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Variables</h4>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Show All
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px]">
                          <DialogHeader>
                            <DialogTitle>Dataset Variables</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {dataset.columns.map((column) => (
                              <div key={column.name} className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm">{column.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {column.type}
                                  </Badge>
                                </div>
                                {column.sample && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    Sample: {column.sample}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dataset.columns.slice(0, 6).map((column) => (
                        <Dialog key={column.name}>
                          <DialogTrigger asChild>
                            <Badge 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                            >
                              {column.name}
                            </Badge>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Variable Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{column.name}</span>
                                <Badge variant="secondary">{column.type}</Badge>
                              </div>
                              {column.sample && (
                                <div className="space-y-1">
                                  <h4 className="text-sm font-medium">Sample Data:</h4>
                                  <p className="text-sm text-muted-foreground">{column.sample}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                      {dataset.columns.length > 6 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-muted transition-colors"
                            >
                              +{dataset.columns.length - 6} more
                            </Badge>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Additional Variables</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              {dataset.columns.slice(6).map((column) => (
                                <div key={column.name} className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">{column.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {column.type}
                                    </Badge>
                                  </div>
                                  {column.sample && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      Sample: {column.sample}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Uploaded {formatDistanceToNow(dataset.uploadedAt)} ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
          ))
        )}
      </div>
      
    </div>
  );
}