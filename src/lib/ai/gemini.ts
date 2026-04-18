import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client with explicit API key from environment
const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Sends the audio or video recording to Gemini to transcribe and extract
 * structured JSON analytics regarding the interview performance.
 */
export async function analyzeInterviewRecording(filePath: string, mimeType: string, role: string) {
  const ai = getAI();

  // 1. Upload via Gemini File API to support large videos & audio
  let uploadedFile = await ai.files.upload({ file: filePath, mimeType: mimeType });

  // 2. If it's a video, wait for Google to finish processing it (poll every 5s, max 2.5 min)
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

  const prompt = `You are an expert technical recruiter and interview coach.
I have provided a recording of a job interview for the role of "${role}".
Carefully listen to the entire recording.
Respond with ONLY a raw valid JSON object — absolutely no markdown, no code fences, no explanations.

Use this exact structure:
{
  "overallScore": <number 0-100>,
  "weaknesses": "<1-2 sentence summary of main weaknesses>",
  "fillerData": [{ "name": "<filler word>", "count": <number> }],
  "weaknessData": [{ "name": "<weakness name>", "value": <number 0-100> }],
  "skillData": [
    { "subject": "Clarity", "A": <number>, "fullMark": 100 },
    { "subject": "Depth", "A": <number>, "fullMark": 100 },
    { "subject": "Structure", "A": <number>, "fullMark": 100 },
    { "subject": "Confidence", "A": <number>, "fullMark": 100 },
    { "subject": "Relevance", "A": <number>, "fullMark": 100 },
    { "subject": "Delivery", "A": <number>, "fullMark": 100 }
  ],
  "timelineData": [{ "time": "MM:SS", "label": "<event description>", "type": "success|warning|error", "pos": <0-100> }],
  "qna": [
    {
      "q": "<exact interview question>",
      "myAnswer": "<candidate verbatim answer from transcript>",
      "score": <number 0-100>,
      "wrong": "<detailed critique of why the answer was weak>",
      "winning": "<example of an ideal strong answer>",
      "highlightWords": ["<filler or weak words from myAnswer>"]
    }
  ]
}
CRITICAL: The qna array MUST include every question asked in the interview (minimum 3 entries).`;

  // 3. Call Gemini with proper parts structure
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

  const outputText = response.text || '{}';

  // Strip any accidental markdown fences
  const cleanJson = outputText
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/\s*```$/im, '')
    .trim();

  try {
    return JSON.parse(cleanJson);
  } catch (parseError) {
    console.error('Failed to parse Gemini JSON output:', cleanJson);
    throw new Error('Gemini returned invalid JSON. Please try again.');
  }
}
