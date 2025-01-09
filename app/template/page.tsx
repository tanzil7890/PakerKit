"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Settings, Clock, BarChart } from "lucide-react";

export default function Template() {
  return (
    <div className="container py-24 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Create and manage your document templates</p>
        </div>
        <Button className="shadow-lg hover:shadow-primary/25 transition-all">
          <Plus className="mr-2 h-4 w-4" /> New Template
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="group-hover:text-primary transition-colors">Invoice Template</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rotate-0 group-hover:rotate-180 duration-300" />
            </div>
            <CardDescription>Standard invoice format with dynamic fields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-primary/70" />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Last used 2 days ago</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Generated 156 documents</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}