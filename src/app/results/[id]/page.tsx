'use client';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { Target, TrendingUp, AlertTriangle, FileAudio, Play, Sparkles, CheckCircle2, XCircle, MessageSquare, StopCircle, Gauge, Activity, Compass, Clock, BookOpen, Loader2, BrainCircuit, ShieldAlert, Zap, BarChart3, ChevronRight, HelpCircle, CheckSquare, Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// --- FALLBACK DEMO DATA WITH NEW PS6 SCHEMA ---
const defaultFillerData = [
  { name: 'umm', count: 24 },
  { name: 'like', count: 18 },
  { name: 'uh', count: 12 },
  { name: 'basically', count: 7 },
  { name: 'you know', count: 5 },
];

const defaultWeaknessData = [
  { name: 'Rambling / No Structure', value: 85, severity: 'High' },
  { name: 'Lack of Specific Examples', value: 75, severity: 'High' },
  { name: 'Defensiveness', value: 60, severity: 'Medium' },
  { name: 'Low Technical Depth', value: 40, severity: 'Medium' },
  { name: 'Pacing (Too Fast)', value: 20, severity: 'Low' },
];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

const defaultSkillData = [
  { subject: 'Clarity', A: 60, fullMark: 100 },
  { subject: 'Depth', A: 85, fullMark: 100 },
  { subject: 'Structure', A: 50, fullMark: 100 },
  { subject: 'Confidence', A: 70, fullMark: 100 },
  { subject: 'Relevance', A: 90, fullMark: 100 },
  { subject: 'Delivery', A: 65, fullMark: 100 },
];

const defaultTimelineData = [
  { time: "0:00", label: "Intro", type: "success", pos: 5 },
  { time: "1:20", label: "Resume Pitch", type: "success", pos: 15 },
  { time: "2:45", label: "Ambiguity Question", type: "error", pos: 30 },
  { time: "5:10", label: "Rambling", type: "warning", pos: 50 },
  { time: "8:20", label: "System Design", type: "success", pos: 70 },
  { time: "11:45", label: "Defensive Tone", type: "error", pos: 90 },
];

const defaultQna = [
  {
    q: "Tell me about a time you had to deal with ambiguity.",
    category: "Behavioral",
    myAnswer: "Umm, yeah, so I was basically working on this feature and like, no one knew what to do. So I uh, I just started coding and umm eventually it worked out.",
    score: 40,
    confidenceScore: 35,
    wpm: 140,
    pauses: 5,
    wrong: "Extremely weak STAR structure. You failed to outline the exact Action you took or the specific Result. Overuse of filler words signals severe lack of confidence.",
    winning: "In my previous role, we were tasked with migrating a legacy service without documentation. I took the initiative to map the architecture, drafted a plan, and reduced transition time by 20%.",
    highlightWords: ["Umm,", "basically", "like,", "uh,", "umm"],
  },
  {
    q: "How do you handle scaling a database for high read traffic?",
    category: "Technical",
    myAnswer: "I would probably use a cache. Maybe Redis. And add more instances if it gets slow.",
    score: 65,
    confidenceScore: 60,
    wpm: 125,
    pauses: 2,
    wrong: "Technically correct, but lacked scalability and ownership depth expected for this role. Did not mention read replicas, indexing strategies, or cache invalidation.",
    winning: "I would implement a caching layer using Redis. If traffic grows, I'd introduce read replicas. Additionally, I'd analyze slow queries and optimize indexing, ensuring proper cache invalidation.",
    highlightWords: ["probably", "Maybe"],
  },
  {
    q: "Describe a time you received critical feedback you disagreed with.",
    category: "Behavioral",
    myAnswer: "Uh, one time someone said my code was messy. I was confused because it worked fine. I just ignored it basically and moved on.",
    score: 25,
    confidenceScore: 80,
    wpm: 150,
    pauses: 1,
    wrong: "Shows extreme defensiveness and an inability to accept constructive criticism or grow from code reviews. A major red flag for collaboration.",
    winning: "A reviewer once pointed out my code wasn't following conventions. Initially I disagreed, but after discussing it, I realized standardizing our patterns was crucial for long-term maintainability. I thanked them and refactored.",
    highlightWords: ["Uh,", "basically"],
  },
  {
    q: "What is your experience with CI/CD pipelines?",
    category: "Technical",
    myAnswer: "So essentially I push code to Github and then GitHub Actions does the rest. I don't really touch the YAML files much.",
    score: 50,
    confidenceScore: 55,
    wpm: 110,
    pauses: 3,
    wrong: "Dismissive attitude toward DevOps responsibilities. Missed opportunity to discuss testing, staging, and deployment safety.",
    winning: "I utilize GitHub Actions for our CI/CD workflows. I've configured pipelines that run our unit test suite, build docker images, and automatically deploy to our staging environment upon merge.",
    highlightWords: ["essentially", "don't really"],
  },
  {
    q: "Why do you want to work here?",
    category: "Behavioral",
    myAnswer: "I heard you guys pay well and you know, the stock is doing great. Plus I kinda need a new job right now.",
    score: 20,
    confidenceScore: 90,
    wpm: 160,
    pauses: 0,
    wrong: "Self-centered and purely transactional. Shows absolutely zero interest in the product, the mission, or the company culture.",
    winning: "I've been following your recent launch of the V2 architecture. I'm deeply passionate about scaling distributed systems, and I want to bring my background in optimization to help solve your current data challenges.",
    highlightWords: ["you know,", "kinda right now."],
  }
];

const defaultImprovementPlan = [
  {
    timeline: "Week 1",
    focus: "Eradicate Rambling (STAR Method Mastery)",
    actionableTasks: [
      "Write down 5 core career stories in strict Situation-Task-Action-Result format.",
      "Practice delivering them out loud in under 2 minutes each with a stopwatch."
    ]
  },
  {
    timeline: "Week 2",
    focus: "Technical Depth & Assertiveness",
    actionableTasks: [
      "Stop using hedging words ('probably', 'maybe'). State technical decisions as facts.",
      "Always append the 'Why' and the 'Trade-offs' to any architectural answer."
    ]
  },
  {
    timeline: "Week 3",
    focus: "Pacing and Pause Control",
    actionableTasks: [
      "Record yourself answering random behavioral questions.",
      "Force a 2-second silent pause before answering instead of immediately using 'Um' or 'Uh'."
    ]
  },
  {
    timeline: "Week 4",
    focus: "Mock Interview Marathon",
    actionableTasks: [
      "Conduct two full 45-minute mock interviews simulating real pressure.",
      "Review the recordings exclusively for tone of voice, posture, and confident delivery."
    ]
  }
];

// Helper to mathematically guarantee Heatmap positions are perfectly scaled 0-100%
const normalizePositions = (timeline: any[]) => {
  if (!timeline || !Array.isArray(timeline) || timeline.length === 0) return [];
  const maxIdx = timeline.length > 1 ? timeline.length - 1 : 1;
  
  return timeline.map((t, idx) => {
    // Strictly force a beautiful, even distribution to prevent AI hallucination (like 225%)
    // Items will naturally step across the width of the display.
    const calculatedPos = Math.round((idx / maxIdx) * 100);
    return {
      ...t,
      pos: calculatedPos
    };
  });
};

export default function ResultsPage() {
  const params = useParams();
  const supabase = createClient();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [roadmapDays, setRoadmapDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const id = params.id as string;
      
      // 1. Try LocalStorage first (for instant results)
      if (id && id.startsWith("real_analysis_")) {
        const savedRaw = localStorage.getItem(`hiredx_${id}`);
        if (savedRaw) {
          try {
            setData(JSON.parse(savedRaw));
            setLoading(false);
            return;
          } catch(e) {}
        }
      }

      // 2. Try Supabase if it's a UUID-based ID (stored results)
      const cleanId = id?.replace('real_analysis_', '');
      if (cleanId && cleanId.length > 10) { // Simple UUID check
        const { data: dbData, error } = await supabase
          .from('interviews')
          .select('report_data')
          .eq('id', cleanId)
          .single();
        
        if (dbData && !error) {
          setData(dbData.report_data);
          setLoading(false);
          return;
        }
      }

      // 3. Fallback to Demo
      if (id === 'demo' || !data) {
        setData({
          overallScore: 42,
          weaknesses: "Candidate demonstrates significant lack of interview structure and overuse of filler words. Technical depth is present but overshadowed by poor delivery and high rejection signals in behavioral responses.",
          fillerData: defaultFillerData,
          weaknessData: defaultWeaknessData,
          skillData: defaultSkillData,
          timelineData: defaultTimelineData,
          qna: defaultQna,
          improvementPlan: defaultImprovementPlan
        });
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading || !data) return <div className="p-20 text-center text-muted-foreground flex justify-center items-center gap-2 min-h-screen"><Loader2 className="animate-spin w-5 h-5"/> Compiling Report...</div>;

  const { overallScore, fillerData, weaknessData, skillData, timelineData, qna, improvementPlan } = data;

  // Derive Confidence Trend with fallback to standard score if user is viewing older cached data
  const confidenceTrend = (qna || []).map((q: any, i: number) => ({
    name: `Q${i+1}`,
    score: q.confidenceScore || q.score || 0,
    category: q.category || 'Unknown'
  }));

  const normalizedTimeline = normalizePositions(timelineData);

  // Rejection Probability math (Inverse of overall score roughly)
  const rejectionProb = Math.max(0, 100 - overallScore);
  const scoreColor = overallScore >= 75 ? 'text-green-500' : overallScore >= 50 ? 'text-yellow-500' : 'text-destructive';

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">Analyzed Recording</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1"><FileAudio className="w-4 h-4"/> secure_session.mp4</span>
            </div>
            <h1 className="text-4xl font-bold font-heading mb-2">Rejection Analysis Report</h1>
            <p className="text-muted-foreground">Deep behavioral and speech analytics breakdown.</p>
          </div>
          
          <div className="flex items-center gap-6 bg-card border rounded-2xl p-4 shadow-sm">
             {/* Circular Gauge UI */}
             <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" 
                    strokeDasharray={`${overallScore * 2.51} 251.2`} 
                    className={overallScore >= 75 ? 'text-green-500' : overallScore >= 50 ? 'text-yellow-500' : 'text-destructive'} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold font-heading ${scoreColor}`}>{overallScore}</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Score</span>
                </div>
             </div>
             
             <div className="space-y-1">
                <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rejection Probability</div>
                <div className={`text-3xl font-bold ${rejectionProb > 50 ? 'text-destructive' : 'text-green-500'}`}>{rejectionProb}%</div>
             </div>
          </div>
        </div>

        {/* CUSTOM TABS NAVIGATION */}
        <div className="flex overflow-x-auto border-b bg-card rounded-t-xl px-2 pt-2 gap-2 hide-scrollbar">
           <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
             <Gauge className="w-4 h-4"/> Executive Overview
           </button>
           <button onClick={() => setActiveTab('transcript')} className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'transcript' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
             <MessageSquare className="w-4 h-4"/> Transcript & QnA
           </button>
           <button onClick={() => setActiveTab('analytics')} className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
             <Activity className="w-4 h-4"/> Deep Analytics
           </button>
           <button onClick={() => setActiveTab('roadmap')} className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'roadmap' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
             <Compass className="w-4 h-4"/> Action Roadmap
           </button>
           <button onClick={() => setActiveTab('practice')} className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'practice' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
             <BrainCircuit className="w-4 h-4"/> Practice Bank
           </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="min-h-[500px]">

          {/* TAB 1: OVERVIEW */}
           {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               
               {/* 1. Chief Recruiter's Verdict (Executive Summary) */}
               <Card className="border-primary/40 shadow-2xl bg-gradient-to-r from-primary/5 to-background border-l-4 border-l-primary">
                 <CardHeader className="pb-2">
                   <CardTitle className="flex items-center gap-2 text-xl font-heading text-primary">
                     <ShieldAlert className="w-5 h-5 -mt-0.5" /> Chief Recruiter's Verdict
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-lg font-medium leading-relaxed italic text-foreground/90">
                     "{data.weaknesses || "Analysis complete. Review specific metrics below to understand your score."}"
                   </p>
                   <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-primary/10">
                      <div className="flex items-center gap-2 bg-card p-3 rounded-xl border">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">Primary Gap</p>
                          <p className="text-sm font-bold">{weaknessData?.[0]?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-card p-3 rounded-xl border">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">Top Skill</p>
                          <p className="text-sm font-bold">{(skillData || []).sort((a:any, b:any) => b.A - a.A)[0]?.subject || 'N/A'}</p>
                        </div>
                      </div>
                   </div>
                 </CardContent>
               </Card>
               
               {/* 1A. Heatmap Timeline */}
               {(!normalizedTimeline || normalizedTimeline.length === 0) ? (
                  <Card className="border-border shadow-sm flex items-center justify-center h-32 bg-muted/20">
                    <p className="text-muted-foreground text-sm font-semibold">Timeline not available for this older specific session.</p>
                  </Card>
               ) : (
                <Card className="border-primary/20 shadow-xl overflow-hidden bg-gradient-to-br from-card to-muted/10 relative">
                  {/* Subtle glass glow overlay */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <CardHeader className="bg-background/80 pb-4 border-b backdrop-blur-md">
                    <CardTitle className="flex items-center gap-2 text-xl font-heading">
                      <TrendingUp className="text-primary w-5 h-5"/> Rejection Heatmap Timeline
                    </CardTitle>
                    <CardDescription>Chronological breakdown identifying exact moments where points were lost.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 relative z-10">
                    <div className="relative">
                      <div className="absolute left-[22px] top-3 bottom-4 w-1 bg-border rounded-full" />
                      <div className="space-y-2">
                        {normalizedTimeline.map((item: any, i: number) => {
                          const dotBg   = item.type === 'error'   ? 'bg-destructive shadow-[0_0_10px_hsl(var(--destructive))]'  : item.type === 'success' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]'  : 'bg-yellow-500 shadow-[0_0_10px_#eab308]';
                          const badge   = item.type === 'error'   ? 'bg-destructive/10 text-destructive border-destructive/20'
                                        : item.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        :                           'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                          const icon    = item.type === 'error'   ? '✕' : item.type === 'success' ? '✓' : '~';

                          return (
                            <div key={i} className="flex items-start gap-4 group py-2 px-2 rounded-xl hover:bg-muted/50 transition-all duration-300">
                              <div className={`relative z-10 w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-[16px] shadow-sm ring-4 ring-background ${dotBg}`}>
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0 pt-1.5 w-full">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-foreground text-sm tracking-wide">{item.label}</span>
                                  <span className={`text-xs font-mono border rounded px-2 py-0.5 font-bold ${badge}`}>
                                    {item.time || '--:--'}
                                  </span>
                                </div>
                                <div className="w-full mt-2 h-1.5 rounded-full bg-muted overflow-hidden relative">
                                  {/* Ensure the bar cap doesn't exceed 100% visually */}
                                  <div className={`absolute top-0 left-0 h-full rounded-full ${dotBg} opacity-80 transition-all duration-1000`} style={{ width: `${Math.min(100, Math.max(2, item.pos))}%` }} />
                                </div>
                                {i > 0 && <p className="text-[11px] text-muted-foreground mt-1 font-semibold uppercase">{item.pos}% through interview</p>}
                                {i === 0 && <p className="text-[11px] text-muted-foreground mt-1 font-semibold uppercase">Interview Start</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
               )}

               {/* 1B. Skill Breakdown Linear Progress */}
               <Card className="border-primary/10 shadow-xl bg-gradient-to-tr from-card to-muted/10">
                  <CardHeader className="bg-background/80 pb-4 border-b backdrop-blur-md">
                    <CardTitle className="flex items-center gap-2 text-xl font-heading"><Target className="text-primary w-5 h-5"/> Skill Breakdown</CardTitle>
                    <CardDescription>Core competencies evaluated against ideal role expectations.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px] flex flex-col justify-center space-y-6 px-8 py-6">
                    {(skillData || []).map((skill: any, idx: number) => {
                      const val = skill.A || 0;
                      // Determine gradient glow based on score
                      const cColor = val >= 75 ? 'bg-green-500 shadow-[0_0_12px_#22c55e88]' : val >= 50 ? 'bg-yellow-500 shadow-[0_0_12px_#eab30888]' : 'bg-destructive shadow-[0_0_12px_hsl(var(--destructive)/0.5)]';
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold tracking-wide text-foreground/90">{skill.subject}</span>
                            <span className="font-mono text-muted-foreground font-bold">{val}/100</span>
                          </div>
                          <div className="w-full h-3 bg-muted/60 rounded-full overflow-hidden shadow-inner">
                             <div className={`h-full ${cColor} rounded-full transition-all duration-1000`} style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
               </Card>

            </div>
          )}

          {/* TAB 2: TRANSCRIPT */}
          {activeTab === 'transcript' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               {(qna || []).map((item: any, index: number) => {
                 
                 // Superior Regex Highlighter that respects boundaries and punctuation
                 const renderText = (text: string) => {
                    if (!item.highlightWords || item.highlightWords.length === 0) return text;
                    
                    // Clean highlight words: strip trailing/leading punctuation from the array elements
                    const cleanWords = item.highlightWords.map((w: string) => w.replace(/^[^\w]+|[^\w]+$/g, ''));
                    if (cleanWords.length === 0) return text;
                    
                    const safeWords = cleanWords.map((sw: string) => sw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                    // Match the words with word boundaries, capturing potential trailing punctuation inside the split so it's preserved
                    const splitRegex = new RegExp(`\\b(${safeWords.join('|')})\\b`, 'gi');
                    
                    const parts = text.split(splitRegex);
                    
                    return parts.map((part, i) => {
                      // Because we captured the word natively, we can just check if part strictly matches (case-insensitive) one of our raw words
                      const isMatch = safeWords.some((sw: string) => new RegExp(`^${sw}$`, 'i').test(part));
                      return isMatch
                        ? <span key={i} className="bg-yellow-500/20 text-yellow-500 font-bold border-b-2 border-yellow-500/50 px-0.5 rounded-sm mx-[0.5px]">{part}</span> 
                        : part;
                    });
                 };

                return (
                  <Card key={index} className="overflow-hidden border-border/50">
                    <CardHeader className="bg-card border-b p-4">
                      {/* Micro-metrics Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="bg-primary/5">{item.category || "General"}</Badge>
                        {item.wpm && <Badge variant="outline" className="bg-muted text-muted-foreground"><Clock className="w-3 h-3 mr-1"/> {item.wpm} WPM</Badge>}
                        {item.pauses !== undefined && <Badge variant="outline" className="bg-muted text-muted-foreground"><StopCircle className="w-3 h-3 mr-1"/> {item.pauses} Pauses</Badge>}
                        {item.confidenceScore && <Badge variant="outline" className={item.confidenceScore > 65 ? "text-green-500" : "text-yellow-500"}><Activity className="w-3 h-3 mr-1"/> {item.confidenceScore}% Confidence</Badge>}
                      </div>
                      <CardTitle className="text-xl">Q: {item.q}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                        <div className="p-6 bg-muted/20">
                          <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2"><FileAudio className="w-4 h-4"/> Your Verbatim Answer</h4>
                          <p className="text-foreground leading-relaxed italic border-l-2 border-primary/40 pl-4">{renderText(item.myAnswer)}</p>
                        </div>
                        <div className="p-6 bg-card">
                          <h4 className="text-sm font-bold text-destructive mb-3 flex items-center gap-2"><XCircle className="w-4 h-4"/> Why You Lost Points</h4>
                          <p className="text-destructive/90 mb-6">{item.wrong}</p>
                          <h4 className="text-sm font-bold text-green-500 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Ideal Winning Answer</h4>
                          <p className="text-muted-foreground border-l-2 border-green-500/40 pl-4 italic">{item.winning}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
               })}
            </div>
          )}

          {/* TAB 3: DEEP ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               
               <div className="grid md:grid-cols-2 gap-6">
                 {/* Ranked Weaknesses List */}
                 <Card className="border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive w-5 h-5"/> Ranked Weakness Impact</CardTitle>
                      <CardDescription>Major rejection signals ranked by severity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(weaknessData || []).sort((a:any, b:any) => b.value - a.value).map((w: any, idx: number) => (
                           <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted">
                             <span className="font-semibold">{w.name}</span>
                             <Badge variant="outline" className={
                               w.severity === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                               w.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                               'bg-green-500/10 text-green-500 border-green-500/20'
                             }>{w.severity || 'Medium'}</Badge>
                           </div>
                        ))}
                      </div>
                    </CardContent>
                 </Card>

                 {/* Confidence Trend Chart */}
                 <Card className="border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Activity className="text-primary w-5 h-5"/> Confidence Trend</CardTitle>
                      <CardDescription>Fluctuations in vocal confidence across questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={confidenceTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#888" />
                          <YAxis domain={[0, 100]} stroke="#888" />
                          <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333'}} />
                          <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                 </Card>
               </div>

               {/* Filler Words */}
               <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="text-yellow-500 w-5 h-5"/> Filler Word Frequency</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fillerData || []} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" stroke="#888" />
                        <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                        <RechartsTooltip cursor={{fill: '#222'}} contentStyle={{backgroundColor: '#111', borderColor: '#333'}} />
                        <Bar dataKey="count" fill="#eab308" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
               </Card>
            </div>
          )}

          {/* TAB 4: ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
               <div className="flex justify-center mb-6">
                 <div className="bg-card border p-1 rounded-full flex items-center shadow-sm">
                   {[14, 30, 45, 90].map((days) => (
                     <button
                       key={days}
                       onClick={() => setRoadmapDays(days)}
                       className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${roadmapDays === days ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20' : 'text-muted-foreground hover:text-foreground bg-muted/30'}`}
                     >
                       {days} Days
                     </button>
                   ))}
                 </div>
               </div>
               
               <Card className="border-primary/30 shadow-lg bg-card/50">
                  <CardHeader className="text-center pb-8 border-b border-primary/10 bg-primary/5">
                    <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-heading">Your {roadmapDays}-Day Targeted Action Plan</CardTitle>
                    <CardDescription className="text-base mt-2">
                       A mathematically generated practice roadmap designed explicitly to eliminate your core rejection signals.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 md:p-12">
                     <div className="relative">
                       {/* Line */}
                       <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent rounded-full" />
                       
                       <div className="space-y-12">
                         {((improvementPlan || defaultImprovementPlan).map((week: any, idx: number) => {
                           // Scale weeks based on roadmapDays/30 ratio approx
                           const currentRatio = roadmapDays / 30;
                           const scaledIdx = Math.floor(idx * currentRatio) + 1;
                           const isLast = idx === (improvementPlan || defaultImprovementPlan).length - 1;
                           const timelineLabel = roadmapDays === 30 ? week.timeline : 
                                               roadmapDays < 30 ? (idx === 0 ? "Days 1-7" : "Days 8-14") :
                                               `Phase ${idx + 1} (Days ${Math.floor(idx * roadmapDays/4) + 1}-${Math.floor((idx+1) * roadmapDays/4)})`;

                           return (
                             <div key={idx} className="relative pl-16">
                                {/* Glowing node */}
                                <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-primary shadow-[0_0_15px_hsl(var(--primary))] ring-4 ring-background" />
                                
                                <h3 className="text-sm font-bold tracking-widest text-primary uppercase mb-1">{timelineLabel}</h3>
                                <h4 className="text-2xl font-bold font-heading mb-4 text-foreground">{week.focus}</h4>
                                
                                <div className="space-y-3">
                                  {week.actionableTasks.map((task: string, tIdx: number) => (
                                    <div key={tIdx} className="flex items-start gap-3 bg-muted/40 p-4 rounded-xl border border-muted/50 hover:border-primary/30 hover:bg-muted/60 transition-colors">
                                      <BookOpen className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                      <p className="text-foreground/90">{task}</p>
                                    </div>
                                  ))}
                                </div>
                             </div>
                           );
                         }))}
                       </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
          )}

          {/* TAB 5: PRACTICE BANK */}
          {activeTab === 'practice' && (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6">
                 <div>
                   <h2 className="text-3xl font-bold font-heading">Practice Bank</h2>
                   <p className="text-muted-foreground">10 Targeted drills to fix your specific rejection signals.</p>
                 </div>
                 <div className="flex md:justify-end">
                   <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                     <BrainCircuit className="w-3 h-3" /> ANALYZED FROM YOUR RECORDING
                   </Badge>
                 </div>
               </div>

               <div className="grid gap-6">
                 {(data.practiceBank || [
                   {
                     question: "Walk me through your most complex project, but focus strictly on the technical trade-offs you made.",
                     category: "Technical",
                     why: "Your analysis showed high depth but a 'defensive' tone when explaining technical choices. Focus on objective trade-offs.",
                     answerStructure: "1. Brief Goal -> 2. The Conflict/Problem -> 3. Option A vs Option B -> 4. Why we chose A -> 5. Outcome.",
                     tip: "Avoid saying 'I just did it'. Use phrases like 'We evaluated Redis for sub-millisecond latency but skipped it due to cost constraints'."
                   },
                   {
                     question: "Tell me about a time you handled a critical bug. Use the STAR method to keep it under 2 minutes.",
                     category: "Behavioral",
                     why: "You rambled during behavioral answers (WPM > 140). This drill forces brevity.",
                     answerStructure: "Situation (20s) -> Task (10s) -> Action (40s) -> Result (20s).",
                     tip: "Stop speaking once you share the Result. Don't add '...and yeah, that was it'."
                   },
                   {
                     question: "How would you handle a stakeholder who constantly changes requirements?",
                     category: "Clarity",
                     why: "Your delivery score was low for conflict-based questions. You sounded hesitant.",
                     answerStructure: "1. Acknowledge the change -> 2. Communicate impact on timeline -> 3. Propose a prioritization meeting.",
                     tip: "Maintain a collaborative, non-victim tone. Focus on project health, not personal frustration."
                   },
                   {
                     question: "Describe a situation where you had to make a decision with only 50% of the information you needed.",
                     category: "Ambiguity",
                     why: "Analysis identified hesitation in decision-making scenarios.",
                     answerStructure: "1. The Gap -> 2. Risk Assessment -> 3. Action taken -> 4. How you mitigated the unknown.",
                     tip: "Emphasize speed over perfection in ambiguous phases."
                   },
                   {
                     question: "How do you explain technical debt to a non-technical CEO?",
                     category: "Communication",
                     why: "Clarity score was average. This tests your ability to simplify without losing meaning.",
                     answerStructure: "Real-world analogy (e.g. credit card) -> Business impact (slower features) -> Solution.",
                     tip: "Avoid jargon like 'refactoring' or 'boilerplate'."
                   },
                   {
                     question: "Tell me about a time you mentored a peer who was underperforming.",
                     category: "Leadership",
                     why: "Behavioral analysis suggested a focus on individual tasks over team growth.",
                     answerStructure: "1. Observe -> 2. Private feedback -> 3. Collaborative plan -> 4. Outcome.",
                     tip: "Show empathy but maintain professional standards."
                   },
                   {
                     question: "What's the hardest technical decision you've made in the last year?",
                     category: "Technical",
                     why: "Technical depth shows well, but ownership signals could be stronger.",
                     answerStructure: "1. The context -> 2. The technical options -> 3. The data used to decide -> 4. Post-mortem.",
                     tip: "Include a mistake you made during the process for 'extreme ownership'."
                   },
                   {
                     question: "How do you handle 'imposter syndrome' during high-stakes technical meetings?",
                     category: "Confidence",
                     why: "Confidence trend dipped during the system design phase.",
                     answerStructure: "1. Preparation -> 2. Active listening -> 3. Asking clarifying questions.",
                     tip: "Remember that admitting you don't know something is a senior signal."
                   },
                   {
                     question: "What is your process for receiving and applying critical feedback?",
                     category: "Growth",
                     why: "Analysis detected a 'high' defensiveness signal.",
                     answerStructure: "1. Listen without interrupting -> 2. Ask questions to understand -> 3. Create a change log.",
                     tip: "Explicitly mention a time you were WRONG and how you fixed it."
                   },
                   {
                     question: "Where do you see the biggest inefficiency in your current team's workflow?",
                     category: "Productivity",
                     why: "Tests your 'high-agency' thinking beyond just coding tickets.",
                     answerStructure: "1. Identify the bottleneck -> 2. Quantify the cost -> 3. Your proposed fix.",
                     tip: "Focus on process, not people."
                   }
                 ]).map((item: any, i: number) => (
                   <Card key={i} className="group border-border/60 hover:border-primary/40 transition-all bg-card/60 backdrop-blur-sm overflow-hidden">
                     <div className="grid md:grid-cols-[1fr_2fr] divide-y md:divide-y-0 md:divide-x">
                        <div className="p-6 bg-muted/20 space-y-4">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                               {i + 1}
                             </div>
                             <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest">{item.category}</Badge>
                           </div>
                           
                           <div>
                             <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                               <Info className="w-3 h-3" /> Why This Drill?
                             </h4>
                             <p className="text-sm font-medium text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                               {item.why}
                             </p>
                           </div>
                        </div>

                        <div className="p-6 space-y-6">
                           <div>
                             <h3 className="text-xl font-bold font-heading text-foreground group-hover:text-primary transition-colors mb-4 italic">
                               "{item.question}"
                             </h3>
                             
                             <div className="space-y-4">
                               <div className="bg-muted/40 p-4 rounded-xl border border-muted-foreground/10">
                                 <h4 className="text-xs font-bold uppercase text-primary mb-2 flex items-center gap-1.5">
                                   <CheckSquare className="w-4 h-4" /> Recommended Structure
                                 </h4>
                                 <p className="text-sm text-foreground/90 font-medium">
                                   {item.answerStructure?.replace(/\*\*/g, '')}
                                 </p>
                               </div>

                               <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                 <h4 className="text-xs font-bold uppercase text-yellow-500 mb-2 flex items-center gap-1.5">
                                   <Zap className="w-4 h-4" /> Coach's Expert Tip
                                 </h4>
                                 <p className="text-sm text-foreground/80 leading-relaxed">
                                   {item.tip?.replace(/\*\*/g, '')}
                                 </p>
                               </div>
                             </div>
                           </div>
                        </div>
                     </div>
                   </Card>
                 ))}
               </div>
            </div>
          )}

        </div>

      </main>
      <Footer />
    </div>
  );
}
