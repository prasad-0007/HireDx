'use client';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, RadarProps, PolarRadiusAxis,
  PieChart, Pie, Cell 
} from 'recharts';
import { Target, TrendingUp, AlertTriangle, FileAudio, Play, Sparkles, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// --- FALLBACK DEMO DATA ---
const defaultFillerData = [
  { name: 'umm', count: 24 },
  { name: 'like', count: 18 },
  { name: 'uh', count: 12 },
  { name: 'basically', count: 7 },
  { name: 'you know', count: 5 },
];

const defaultWeaknessData = [
  { name: 'Rambling', value: 45 },
  { name: 'Lack of Depth', value: 30 },
  { name: 'Low Confidence', value: 15 },
  { name: 'Defensive', value: 10 },
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
  { time: "11:45", label: "Salary Hesitation", type: "error", pos: 90 },
];

const defaultQna = [
  {
    q: "Tell me about a time you had to deal with ambiguity.",
    myAnswer: "Umm, yeah, so I was basically working on this feature and like, no one knew what to do. So I uh, I just started coding and umm eventually it worked out.",
    score: 40,
    wrong: "Extremely weak STAR structure. You failed to outline the exact Action you took or the specific Result. Overuse of filler words signals low confidence.",
    winning: "In my previous role, we were tasked with migrating a legacy service without documentation. I took the initiative to map the architecture, drafted a plan, and reduced transition time by 20%.",
    highlightWords: ["Umm,", "basically", "like,", "uh,", "umm"],
  },
  {
    q: "How do you handle scaling a database for high read traffic?",
    myAnswer: "I would probably use a cache. Maybe Redis. And add more instances if it gets slow.",
    score: 65,
    wrong: "Technically correct, but lacked scalability and ownership depth expected for an SDE. Did not mention read replicas, indexing strategies, or cache invalidation.",
    winning: "I would implement a caching layer using Redis. If traffic grows, I'd introduce read replicas. Additionally, I'd analyze slow queries and optimize indexing, ensuring proper cache invalidation.",
    highlightWords: ["probably", "Maybe"],
  },
  {
    q: "Describe a time you received critical feedback you disagreed with.",
    myAnswer: "Uh, one time someone said my code was messy. I was confused because it worked fine. I just ignored it basically and moved on.",
    score: 25,
    wrong: "Shows defensiveness and an inability to accept constructive criticism or grow from code reviews.",
    winning: "A reviewer once pointed out my code wasn't following conventions. Initially I disagreed, but after discussing it, I realized standardizing our patterns was crucial for long-term maintainability. I thanked them and refactored the logic.",
    highlightWords: ["Uh,", "basically"],
  }
];

export default function ResultsPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // If it's a real analysis fetched from our upload mechanism
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
    // Otherwise fallback to demo data
    setData({
      overallScore: 72,
      fillerData: defaultFillerData,
      weaknessData: defaultWeaknessData,
      skillData: defaultSkillData,
      timelineData: defaultTimelineData,
      qna: defaultQna
    });
  }, [params.id]);

  if (!data) return <div className="p-20 text-center">Loading Report...</div>;

  const { overallScore, fillerData, weaknessData, skillData, timelineData, qna } = data;

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">Interview Target</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1"><FileAudio className="w-4 h-4"/> processed_audio.mp3</span>
            </div>
            <h1 className="text-4xl font-bold font-heading">Rejection Analysis Report</h1>
            <p className="text-muted-foreground mt-2">Generated by HireDx AI Engine</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Overall Hireability</span>
            <div className="text-6xl font-bold text-primary font-heading tracking-tighter">
              {overallScore || 0}<span className="text-3xl text-muted-foreground">/100</span>
            </div>
          </div>
        </div>

        {/* REJECTION HEATMAP TIMELINE */}
        {(timelineData && timelineData.length > 0) && (
        <Card className="border-primary/20 shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-primary w-5 h-5"/> Rejection Heatmap Timeline
            </CardTitle>
            <CardDescription>Chronological breakdown identifying exactly when you lost the interviewer's interest or signaled lack of confidence.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
             <div className="relative h-24 flex items-center">
                <div className="absolute left-0 right-0 h-2 bg-muted rounded-full"></div>
                {timelineData.map((item: any, i: number) => (
                  <div 
                    key={i} 
                    className="absolute flex flex-col items-center -translate-x-1/2 group"
                    style={{ left: `${Math.max(5, Math.min(item.pos, 95))}%` }}
                  >
                    <div className={`text-xs font-bold mb-2 pb-1 px-2 rounded-md transition-opacity opacity-0 group-hover:opacity-100 absolute bottom-full whitespace-nowrap shadow-md
                      ${item.type === 'error' ? 'bg-destructive text-white' : item.type === 'success' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}
                    `}>
                      {item.label}
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 border-background cursor-pointer hover:scale-125 transition-transform z-10
                      ${item.type === 'error' ? 'bg-destructive' : item.type === 'success' ? 'bg-green-500' : 'bg-yellow-500'}
                    `} />
                    <div className="text-xs text-muted-foreground font-medium mt-2">{item.time || "--:--"}</div>
                  </div>
                ))}
             </div>
             
             <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t text-sm text-muted-foreground">
               <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"/> Strong Signal</span>
               <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"/> Hesitation / Mid</span>
               <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"/> Red Flag / Weakness</span>
             </div>
          </CardContent>
        </Card>
        )}

        {/* CHARTS GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Skill Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={skillData || []}>
                  <PolarGrid stroke="#444" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{fill: '#e5e7eb', fontSize: 14, fontWeight: 'bold'}} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{fill: '#888', fontSize: 10}} 
                    tickCount={6} 
                  />
                  <Radar 
                    name="Score" 
                    dataKey="A" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.4} 
                    label={{ position: 'top', fill: 'hsl(var(--primary))', fontSize: 13, fontWeight: 'bold' }}
                  />
                  <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333'}} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Filler Words Frequency</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fillerData || []} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="name" tick={{fill: '#888', fontSize: 12}} />
                  <YAxis tick={{fill: '#888', fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: '#222'}} contentStyle={{backgroundColor: '#111', borderColor: '#333'}}/>
                  <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Weakness Impact</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weaknessData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#888' }}
                  >
                    {(weaknessData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* QUESTION BY QUESTION */}
        <div className="space-y-6 pt-4">
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <MessageSquare className="w-6 h-6"/> Interview Transcript & AI Evaluation
          </h2>
          
          {(qna || []).map((item: any, index: number) => {
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
              <Card key={index} className={`overflow-hidden border-l-4 ${item.score < 50 ? 'border-l-destructive' : 'border-l-yellow-500'} shadow-md`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg max-w-3xl pr-4">Q{index+1}: {item.q}</h3>
                    <div className="text-right shrink-0">
                      <div className="text-xs uppercase text-muted-foreground font-bold mb-1">Answer Quality</div>
                      <div className={`text-xl font-bold ${item.score < 50 ? 'text-destructive' : 'text-yellow-500'}`}>{item.score}/100</div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* User Answer */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <XCircle className="w-4 h-4 text-destructive"/> Your Answer
                      </div>
                      <div className="p-4 bg-muted/40 rounded-lg text-foreground/90 leading-relaxed text-sm">
                        {renderText(item.myAnswer)}
                      </div>
                      <div className="text-sm p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                        <strong>Why you lost points:</strong> {item.wrong}
                      </div>
                    </div>

                    {/* Winning Answer */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Sparkles className="w-4 h-4 text-primary"/> Ideal 'Winning' Comparison
                      </div>
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-foreground/90 leading-relaxed text-sm">
                        {item.winning}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

      </main>
      <Footer />
    </div>
  );
}
