"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 mx-auto">
        <Link href="/" className="mr-6 flex items-center space-x-2 group">
          <div className="bg-primary/10 p-1.5 rounded-xl group-hover:bg-primary/20 transition-colors">
             <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight hidden sm:inline-block">
            HireDx
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 mr-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/results/demo">
              <Button variant="ghost" className="text-sm font-semibold rounded-full px-5">Demo</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="text-sm rounded-full px-5">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm rounded-full px-6 shadow-md shadow-primary/20">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
