"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Play, Sparkles, ArrowRight } from "lucide-react";


export default function Home() {
  return (
    <div className="relative">
      <div className="pt-24 pb-12 md:pt-32">
        <div className="container flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-2xl bg-muted px-3 py-1 text-sm font-medium mb-4 text-muted-foreground">
            <Sparkles className="mr-2 h-4 w-4" />
            Streamline your document workflow
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Generate multiple custom
            <span className="block text-primary">documents at once</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Transform any document into a dynamic template and generate customized versions in seconds, saving you hours of manual work.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <Link href="/template">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="group">
                  <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Watch Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}