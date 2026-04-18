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
import { Target, TrendingUp, AlertTriangle, FileAudio, Play, Sparkles, CheckCircle2, XCircle, MessageSquare, StopCircle, Gauge, Activity, Compass, Clock, BookOpen, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  }
];

export default function ResultsPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (params.id && typeof params.id === 'string' && params.id.startsWith("real_analysis_")) {
       const savedRaw = localStorage.getItem(`hiredx_${params.id}`);
       if (savedRaw) {
          try {
            const parsed = JSON.parse(savedRaw);
            setData(parsed);
            return;
          } catch(e) {}
       }
    }
    // Fallback
    setData({
      overallScore: 42,
      fillerData: defaultFillerData,
      weaknessData: defaultWeaknessData,
      skillData: defaultSkillData,
      timelineData: defaultTimelineData,
      qna: defaultQna,
      improvementPlan: defaultImprovementPlan
    });
  }, [params.id]);

  if (!data) return <div className="p-20 text-center text-muted-foreground flex justify-center items-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Compiling Report...</div>;

  const { overallScore, fillerData, weaknessData, skillData, timelineData, qna, improvementPlan } = data;

  // Derive Confidence Trend
  const confidenceTrend = (qna || []).map((q: any, i: number) => ({
    name: `Q${i+1}`,
    score: q.confidenceScore || 0,
    category: q.category || 'Unknown'
  }));

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
        </div>

        {/* TAB CONTENTS */}
        <div className="min-h-[500px]">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               
               {/* 1A. Heatmap Timeline */}
               {(timelineData && timelineData.length > 0) && (
                <Card className="border-primary/20 shadow-md overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="text-primary w-5 h-5"/> Rejection Heatmap Timeline
                    </CardTitle>
                    <CardDescription>Chronological breakdown of key moments — hover each event for details.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="relative">
                      <div className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-border" />
                      <div className="space-y-1">
                        {timelineData.map((item: any, i: number) => {
                          const dotBg   = item.type === 'error'   ? 'bg-destructive'  : item.type === 'success' ? 'bg-green-500'  : 'bg-yellow-500';
                          const badge   = item.type === 'error'   ? 'bg-destructive/10 text-destructive border-destructive/20'
                                        : item.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        :                           'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                          const icon    = item.type === 'error'   ? '✕' : item.type === 'success' ? '✓' : '~';

                          return (
                            <div key={i} className="flex items-start gap-4 group py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                              <div className={`relative z-10 w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${dotBg}`}>
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0 pt-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-foreground text-sm">{item.label}</span>
                                  <span className={`text-xs font-mono border rounded px-1.5 py-0.5 ${badge}`}>
                                    {item.time || '--:--'}
                                  </span>
                                </div>
                                <div className="w-full mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                                  <div className={`h-full rounded-full ${dotBg} opacity-70`} style={{ width: `${item.pos}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.pos}% into interview</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
               )}

               {/* 1B. Skill Breakdown Radar */}
               <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="text-primary w-5 h-5"/> Skill Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={skillData || []}>
                        <PolarGrid stroke="#444" />
                        <PolarAngleAxis dataKey="subject" tick={{fill: '#e5e7eb', fontSize: 13, fontWeight: 'bold'}} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fill: '#888', fontSize: 10}} tickCount={6} />
                        <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" strokeWidth={2} fill="hsl(var(--primary))" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
               </Card>

            </div>
          )}

          {/* TAB 2: TRANSCRIPT */}
          {activeTab === 'transcript' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               {(qna || []).map((item: any, index: number) => {
                 
                 // Regex Highlighter
                 const renderText = (text: string) => {
                    if (!item.highlightWords || item.highlightWords.length === 0) return text;
                    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const safeWords = item.highlightWords.map(escapeRegExp);
                    const splitRegex = new RegExp(`(${safeWords.join('|')})`, 'gi');
                    const parts = text.split(splitRegex);
                    
                    return parts.map((part, i) => {
                      const isMatch = safeWords.some(sw => new RegExp(`^${sw}$`, 'i').test(part));
                      return isMatch
                        ? <span key={i} className="bg-yellow-500/20 text-yellow-500 font-semibold px-1 rounded-sm mx-0.5">{part}</span> 
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
               <Card className="border-primary/30 shadow-lg bg-card/50">
                  <CardHeader className="text-center pb-8 border-b border-primary/10 bg-primary/5">
                    <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-heading">Your 30-Day Targeted Action Plan</CardTitle>
                    <CardDescription className="text-base mt-2">
                       A mathematically generated practice roadmap designed explicitly to eliminate your core rejection signals.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 md:p-12">
                     <div className="relative">
                       {/* Line */}
                       <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent rounded-full" />
                       
                       <div className="space-y-12">
                         {(improvementPlan || defaultImprovementPlan).map((week: any, idx: number) => (
                           <div key={idx} className="relative pl-16">
                              {/* Glowing node */}
                              <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-primary shadow-[0_0_15px_hsl(var(--primary))] ring-4 ring-background" />
                              
                              <h3 className="text-sm font-bold tracking-widest text-primary uppercase mb-1">{week.timeline}</h3>
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
                         ))}
                       </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
          )}

        </div>

      </main>
      <Footer />
    </div>
  );
}
