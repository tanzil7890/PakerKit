"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Home, Database, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Dataset",
    icon: Database,
    href: "/dataset",
  },
  {
    label: "Template",
    icon: FileText,
    href: "/template",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-2 transition-colors hover:text-primary">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              DocGen
            </span>
          </Link>
          <div className="flex gap-x-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all duration-200",
                  pathname === route.href
                    ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-x-2">
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </nav>
  );
}