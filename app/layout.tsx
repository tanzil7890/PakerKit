import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Document Generator',
  description: 'Generate multiple custom documents at once',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background">
            {/* Background elements */}
            <div className="fixed inset-0">
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background via-primary/5 to-background opacity-40" />
            </div>
            
            {/* Content wrapper */}
            <div className="relative min-h-screen">
              <Navbar />
              <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                {children}
              </main>
            </div>

            {/* Footer gradient */}
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}