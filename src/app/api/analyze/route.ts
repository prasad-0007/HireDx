import { analyzeInterviewRecording } from '@/lib/ai/gemini';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

export async function POST(req: NextRequest) {
  let tmpFilePath = '';
  let fileObj: File | null = null;
  let roleStr = 'Software Engineer';
  
  try {
    const formData = await req.formData();
    fileObj = formData.get('file') as File | null;
    roleStr = formData.get('role') as string;

    if (!fileObj || !roleStr) {
      return NextResponse.json({ error: 'Missing file or role' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('dummy')) {
      throw new Error("Missing Key");
    }

    const buffer = await fileObj.arrayBuffer();
    const tmpDir = os.tmpdir();
    tmpFilePath = path.join(tmpDir, `upload_${Date.now()}_${fileObj.name}`);
    await fs.writeFile(tmpFilePath, Buffer.from(buffer));
    
    // Attempt Process with Gemini 
    const result = await analyzeInterviewRecording(tmpFilePath, fileObj.type, roleStr);
    
    await fs.unlink(tmpFilePath).catch(()=>{});
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    if (tmpFilePath) {
       await fs.unlink(tmpFilePath).catch(()=>{});
    }

    // ====================================================================================
    // USER REQUESTED: NO MOCKS. ONLY REAL REPORTS.
    // We removed the procedural fallback. If Google's API fails, it will 
    // now explicitly crash and pass the true error back to the frontend.
    // ====================================================================================
    
    return NextResponse.json({ 
      error: error.message || "The Gemini API failed to analyze the video.",
      success: false 
    }, { status: 500 });
  }
}
