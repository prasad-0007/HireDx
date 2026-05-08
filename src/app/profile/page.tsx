'use client';

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, ChevronRight, FileAudio, Calendar, Target, LogIn } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchInterviews() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching interviews:", error);
      } else {
        setInterviews(data || []);
      }
      setLoading(false);
    }

    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/10">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
          <span className="ml-3 text-lg font-medium text-muted-foreground">Loading history...</span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full py-10">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <History className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-heading">Interview History</h1>
            <p className="text-muted-foreground">Review your past performance and track your growth.</p>
          </div>
        </div>

        {!user ? (
          <Card className="border-dashed border-2 py-20 text-center">
            <CardContent className="space-y-4">
              <div className="mx-auto bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <LogIn className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold">Please log in to see your history</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                We store your interview reports securely in your account so you can access them anywhere.
              </p>
              <Link href="/login">
                <Button className="mt-4 rounded-full px-8">Log in now</Button>
              </Link>
            </CardContent>
          </Card>
        ) : interviews.length === 0 ? (
          <Card className="border-dashed border-2 py-20 text-center">
            <CardContent className="space-y-4">
              <div className="mx-auto bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FileAudio className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold">No interviews analyzed yet</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Upload your first recording to start receiving deep behavioral analytics.
              </p>
              <Link href="/analyze">
                <Button className="mt-4 rounded-full px-8">Analyze My First Interview</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <Link key={interview.id} href={`/results/real_analysis_${interview.id}`}>
                <Card className="group hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold font-heading shadow-inner ${
                        interview.overall_score >= 75 ? 'bg-green-500/10 text-green-500' : 
                        interview.overall_score >= 50 ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {interview.overall_score}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                          {interview.role_target || 'General Interview'}
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest hidden sm:flex">
                            Analyzed
                          </Badge>
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(interview.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold">
                            <Target className="w-3 h-3" />
                            Target: {interview.role_target === 'sde' ? 'Software Engineer' : interview.role_target}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                       <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Rejection Prob</p>
                          <p className={`text-lg font-bold ${interview.overall_score >= 75 ? 'text-green-500' : 'text-destructive'}`}>
                            {100 - interview.overall_score}%
                          </p>
                       </div>
                       <Button variant="ghost" size="icon" className="group-hover:translate-x-1 group-hover:bg-primary/10 group-hover:text-primary transition-all rounded-full">
                         <ChevronRight className="w-5 h-5" />
                       </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
