import { GoogleGenAI } from '@google/genai';

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes an interview recording using Gemini with:
 * - Chain-of-Thought (CoT) reasoning for structured thinking before output
 * - Few-shot examples to ground the model's output format and quality bar
 */
export async function analyzeInterviewRecording(filePath: string, mimeType: string, role: string) {
  const ai = getAI();

  // 1. Upload via Gemini File API
  let uploadedFile = await ai.files.upload({ file: filePath, mimeType: mimeType });

  // 2. Poll until video processing is complete
  if (mimeType.startsWith('video/')) {
    let attempts = 0;
    while (uploadedFile.state === 'PROCESSING' && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      uploadedFile = await ai.files.get({ name: uploadedFile.name! });
      attempts++;
    }
    if (uploadedFile.state === 'FAILED') {
      throw new Error('Video processing failed on Google servers.');
    }
  }

  // ============================================================
  // PROMPTING STRATEGY: Chain-of-Thought (CoT) + Few-Shot
  //
  // CoT: Forces the model to reason step-by-step BEFORE outputting
  //      the final JSON, dramatically improving accuracy.
  //
  // Few-Shot: Provides 1 worked example so the model understands
  //           the exact expected quality bar for critique and scoring.
  // ============================================================
  const prompt = `You are an expert technical recruiter and behavioral interview coach at a top-tier tech company.

I will provide you an interview recording for the role of "${role}".

## INSTRUCTIONS: Think step by step before responding (Chain-of-Thought Reasoning)

Step 1 — TRANSCRIBE: Listen carefully and mentally transcribe the full conversation. Identify every question asked and every answer given.

Step 2 — SPEECH ANALYSIS: For each answer, count filler words (um, uh, like, basically, you know, so, right). Note confidence level based on pauses, hedging language, and decisiveness.

Step 3 — QUALITY ANALYSIS: For each answer, evaluate on:
  - Clarity: Was the answer easy to follow?
  - Depth: Did they explain HOW and WHY, not just WHAT?
  - Structure: Did they use STAR method or logical flow for behavioral questions?
  - Confidence: Did they sound certain and authoritative?
  - Relevance: Did they actually answer what was asked?
  - Delivery: Was the pace, tone, and energy appropriate?

Step 4 — WEAKNESS RANKING: Which weaknesses had the highest impact on rejection probability?

Step 5 — OUTPUT JSON: Based on your analysis above, output the final JSON.

---

## FEW-SHOT EXAMPLE (One-Shot Reference)

Input context: Candidate for Software Engineer role answered "Tell me about yourself" with: "Um, so I have like, 2 years of experience. I basically worked on some web projects. You know, I used React and stuff."

Expected output for that single QnA entry:
{
  "q": "Tell me about yourself.",
  "myAnswer": "Um, so I have like, 2 years of experience. I basically worked on some web projects. You know, I used React and stuff.",
  "score": 32,
  "wrong": "No structure whatsoever. 4 filler words in 2 sentences. Vague ('some web projects', 'stuff') with zero specifics about impact or achievements. Interviewer gained nothing memorable.",
  "winning": "I'm a software engineer with 2 years of experience specializing in React and Node.js. At my previous company, I led the frontend migration from a legacy jQuery codebase to React, which reduced page load times by 40% and improved team velocity significantly.",
  "highlightWords": ["Um,", "like,", "basically", "You know,", "stuff"]
}

---

## OUTPUT FORMAT

Now analyze the actual recording provided and respond with ONLY a raw JSON object. No markdown. No explanations. No code fences.

{
  "overallScore": <number 0-100>,
  "weaknesses": "<2-3 sentence summary of the primary reasons this candidate would likely be rejected>",
  "fillerData": [{ "name": "<filler word>", "count": <total count across entire interview> }],
  "weaknessData": [{ "name": "<weakness category>", "value": <impact score 0-100, higher = more impactful> }],
  "skillData": [
    { "subject": "Clarity", "A": <0-100>, "fullMark": 100 },
    { "subject": "Depth", "A": <0-100>, "fullMark": 100 },
    { "subject": "Structure", "A": <0-100>, "fullMark": 100 },
    { "subject": "Confidence", "A": <0-100>, "fullMark": 100 },
    { "subject": "Relevance", "A": <0-100>, "fullMark": 100 },
    { "subject": "Delivery", "A": <0-100>, "fullMark": 100 }
  ],
  "timelineData": [{ "time": "MM:SS", "label": "<specific event>", "type": "success|warning|error", "pos": <0-100> }],
  "qna": [
    {
      "q": "<exact question asked>",
      "myAnswer": "<verbatim candidate answer from transcript>",
      "score": <0-100>,
      "wrong": "<specific, detailed critique — what exactly failed and why>",
      "winning": "<concrete example of a strong answer to this same question>",
      "highlightWords": ["<weak or filler words from myAnswer to highlight>"]
    }
  ]
}

CRITICAL RULES:
- qna MUST contain every question from the interview (minimum 3 entries)
- weaknessData MUST have at least 3 entries ranked by impact
- Output nothing except the JSON object`;

  // 3. Call Gemini
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: [
      {
        role: 'user',
        parts: [
          { fileData: { fileUri: uploadedFile.uri!, mimeType: uploadedFile.mimeType! } },
          { text: prompt }
        ]
      }
    ]
  });

  // 4. PRIVACY: Immediately delete from Google's servers after analysis
  try {
    await ai.files.delete({ name: uploadedFile.name! });
    console.log(`Privacy: File ${uploadedFile.name} deleted from Google servers.`);
  } catch (deleteErr) {
    console.warn('Could not delete file from Google servers (non-critical):', deleteErr);
  }

  const outputText = response.text || '{}';
  console.log('Raw Gemini output (first 500 chars):', outputText.slice(0, 500));

  // 5. Robust JSON extraction: find outermost { } block
  const firstBrace = outputText.indexOf('{');
  const lastBrace = outputText.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    console.error('No JSON object found in Gemini response:', outputText);
    throw new Error('Gemini did not return a valid JSON object. Try a shorter video or try again.');
  }

  const extracted = outputText.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(extracted);
  } catch (parseError) {
    console.error('Failed to parse extracted JSON:', extracted.slice(0, 500));
    throw new Error('Gemini returned malformed JSON. Please try uploading again.');
  }
}
