'use client';
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud, Mic, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AnalyzePage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorObj, setErrorObj] = useState("");

  const handleAnalyze = async () => {
    if (!role) return;
    setIsUploading(true);
    setErrorObj("");

    // If no file is uploaded, fallback to the instant demo mode!
    if (!file) {
      setTimeout(() => {
        router.push("/results/demo");
      }, 1500);
      return;
    }

    try {
      // Step 1: Send real file to our Gemini API Route
      const formData = new FormData();
      formData.append("file", file);
      formData.append("role", role);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      // Step 2: Store real AI results in localStorage temporary DB for frontend display
      const resultId = `real_analysis_${Date.now()}`;
      localStorage.setItem(`hiredx_${resultId}`, JSON.stringify(data.result));

      // Step 3: Redirect to dynamic results page
      router.push(`/results/${resultId}`);

    } catch (err: any) {
      setErrorObj(err.message || "Failed to analyze. Did you add your GEMINI_API_KEY?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col py-10">
        <div className="mb-8 p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-foreground max-w-2xl text-balance">
            <strong>Hackathon Hint:</strong> If you upload a file, the app will execute a REAL AI analysis using Gemini. If you don't upload a file and just click "Analyze", it instantly bypasses to the Demo Dashboard!
          </div>
        </div>

        <Card className="w-full shadow-lg border-primary/10">
          <CardHeader className="text-center pb-8 border-b">
            <CardTitle className="text-3xl font-heading">Start New Analysis</CardTitle>
            <CardDescription className="text-base mt-2">
              Upload an interview recording to uncover hidden rejection signals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-8 p-6 md:p-10">
            {/* Step 1: Role Selection */}
            <div className="space-y-4">
              <Label htmlFor="role" className="text-lg font-bold">1. Select Interview Target Role</Label>
              <p className="text-sm text-muted-foreground">Our AI adjusts the scoring criteria based on the standard expectations for this role.</p>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="h-12 w-full md:w-2/3 shadow-sm border-2">
                  <SelectValue placeholder="e.g. Software Engineer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sde">Software Engineer</SelectItem>
                  <SelectItem value="frontend">Frontend Developer</SelectItem>
                  <SelectItem value="backend">Backend Developer</SelectItem>
                  <SelectItem value="pm">Product Manager</SelectItem>
                  <SelectItem value="data">Data Analyst</SelectItem>
                  <SelectItem value="sales">Sales & BD</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Upload */}
            <div className="space-y-4">
               <Label className="text-lg font-bold">2. Upload Recording (Optional for Demo)</Label>
               <p className="text-sm text-muted-foreground">Supported formats: MP3, WAV, MP4, MOV. Max size: 50MB.</p>
               
               <div className="grid md:grid-cols-2 gap-4 mt-2">
                 <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      accept="audio/*,video/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${file ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                      <UploadCloud className={`h-6 w-6 ${file ? 'text-green-500' : 'text-primary'}`} />
                    </div>
                    <p className="font-medium">{file ? file.name : "Click to upload or drag & drop"}</p>
                    <p className="text-xs text-muted-foreground mt-1 text-balance">Audio or Video files only</p>
                 </div>

                 <div className="border-2 border-muted-foreground/10 rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-50 bg-muted/20">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Mic className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">Record live in browser</p>
                    <p className="text-xs text-muted-foreground mt-1">Feature coming soon</p>
                 </div>
               </div>
            </div>

            {errorObj && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                <strong>Error: </strong> {errorObj}
              </div>
            )}

            {/* CTA */}
            <div className="pt-8 flex justify-end">
               <Button 
                 size="lg" 
                 className="h-12 px-8 w-full md:w-auto shadow-md"
                 disabled={!role || isUploading}
                 onClick={handleAnalyze}
               >
                 {isUploading ? (
                   <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Analyzing Recording...</>
                 ) : (
                   file ? "Start Real AI Analysis" : "View Instant Demo"
                 )}
               </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
