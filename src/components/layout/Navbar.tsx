import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 mx-auto">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-xl tracking-tight hidden sm:inline-block">
            HireDx
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/dashboard/demo">
              <Button variant="ghost" className="text-sm font-semibold">Demo</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="text-sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
