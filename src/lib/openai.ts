import OpenAI from 'openai';
import { normalizeAnalysisFromContent, parseAiJsonObject } from '@/lib/ai-contract';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const file = new File([new Uint8Array(audioBuffer)], filename, { type: 'audio/webm' });
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'text',
  });
  return response;
}

export async function analyzeTranscript(
  transcript: string,
  projectContext: string,
  sessionHistory: string,
  existingDocuments: Array<{ id: string; name: string; content: string }>,
  sessionId: string
): Promise<import('./types').AnalysisResult> {
  const documentsContext = existingDocuments
    .map((d) => `Document "${d.name}":\n${d.content.slice(0, 500)}`)
    .join('\n\n');

  const systemPrompt = `You are a deeply attentive writing collaborator and story analyst. You have read all material in this project and remember everything across sessions. Your job is NOT to clean up the writing or make it sound professional — your job is to notice things, hold threads, and push on what matters.

You analyze voice transcripts from a storytelling/memoir project. The transcript is raw, unedited speech — preserve that voice.

Your analysis must:
1. Identify which document this material belongs in (be specific about why)
2. Flag tangents — places where the speaker changed subjects mid-thought and never came back
3. Detect patterns that recur across sessions
4. Identify gaps — specific missing pieces, not generic "you need more"
5. Name contradictions with existing material
6. Generate specific interviewer-style questions (not "how did that make you feel" — questions like "what happened right before that")
7. Annotate the transcript with markers for important moments, connections, and unfinished threads
8. Name the significance of things the speaker seems to minimize
9. Note if any passage could be written in the speaker's voice for a draft
10. Propose concept/library candidates that should be named and tracked

Respond with valid JSON only.`;

  const userPrompt = `Analyze this new voice transcript for the project.

PROJECT CONTEXT:
${projectContext}

SESSION HISTORY (previous sessions):
${sessionHistory}

EXISTING DOCUMENTS:
${documentsContext}

NEW TRANSCRIPT (Session ID: ${sessionId}):
${transcript}

Return a JSON object with this exact structure:
{
  "documentSuggestion": {
    "documentId": "id if it matches an existing document, otherwise null",
    "documentName": "name of document this belongs in",
    "reason": "specific reason why"
  },
  "tangents": [
    {
      "thread": "brief description of the abandoned thread",
      "context": "exact quote or paraphrase of where it was dropped"
    }
  ],
  "patterns": [
    {
      "description": "description of the recurring pattern",
      "sessionRefs": ["sessionId"]
    }
  ],
  "gaps": [
    {
      "description": "specific gap description",
      "documentRef": "document name if relevant"
    }
  ],
  "contradictions": [
    {
      "description": "what conflicts",
      "existing": "what was said before",
      "new": "what was just said"
    }
  ],
  "questions": [
    "specific question 1",
    "specific question 2"
  ],
  "concepts": [
    {
      "name": "proposed concept name",
      "definition": "one-line definition",
      "sourceSession": "session id",
      "linkedDocument": "document name if relevant",
      "status": "developing|complete|contradicted (must be one of these exact values)"
    }
  ],
  "annotations": [
    {
      "text": "annotation text",
      "type": "important|connection|unfinished|tangent|pattern",
      "reference": "optional reference"
    }
  ],
  "significance": "if the speaker minimized something important, name it explicitly here",
  "voicePreservedDraft": "optional: a brief passage written in the speaker's actual voice based on this material"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content || '{}';
  const normalized = normalizeAnalysisFromContent(content);
  const hasAnalysisSignal =
    normalized.tangents.length > 0 ||
    normalized.patterns.length > 0 ||
    normalized.gaps.length > 0 ||
    normalized.contradictions.length > 0 ||
    normalized.questions.length > 0 ||
    normalized.annotations.length > 0 ||
    !!normalized.significance ||
    !!normalized.voicePreservedDraft ||
    !!normalized.documentSuggestion;

  if (!hasAnalysisSignal && content.trim() !== '{}' && content.trim().length > 0) {
    console.warn('OpenAI analysis response normalized to empty result.');
  }

  return normalized;
}

export async function generateVoicePreservedDraft(
  prompt: string,
  transcripts: string[],
  documentContext: string
): Promise<string> {
  const voiceSamples = transcripts.slice(0, 5).join('\n\n---\n\n');

  const systemPrompt = `You are a ghostwriter who writes ENTIRELY in the speaker's voice. Study these voice transcripts carefully — the cadence, word choices, sentence fragments, how they circle back, what they emphasize, their specific vocabulary. Write the requested passage so that when the speaker reads it back, they think "yeah, that sounds exactly like me." Do NOT clean it up. Do NOT make it sound literary or professional. Capture the actual way they talk.`;

  const userPrompt = `VOICE SAMPLES FROM TRANSCRIPTS:
${voiceSamples}

RELEVANT DOCUMENT CONTENT:
${documentContext}

WRITING REQUEST:
${prompt}

Write this in the speaker's actual voice as learned from the transcripts above.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
  });

  return response.choices[0].message.content || '';
}

export async function detectVoiceDrift(
  draft: string,
  transcripts: string[]
): Promise<{ hasDrift: boolean; details: string; rewriteSuggestion?: string }> {
  const voiceSamples = transcripts.slice(0, 8).join('\n\n---\n\n');
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You compare generated writing to transcript voice patterns and detect drift. Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Analyze whether this generated draft has drifted from the speaker's natural voice.

VOICE SAMPLES:
${voiceSamples}

GENERATED DRAFT:
${draft}

Return JSON:
{
  "hasDrift": true/false,
  "details": "specific explanation of what drifted or why it matches",
  "rewriteSuggestion": "optional short suggestion closer to voice"
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  let result: unknown = {};
  try {
    result = JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Voice drift JSON parse failed:', error);
    result = {};
  }

  const parsed = (result && typeof result === 'object' ? result : {}) as Record<string, unknown>;
  return {
    hasDrift: Boolean(parsed.hasDrift),
    details: typeof parsed.details === 'string' ? parsed.details : '',
    rewriteSuggestion:
      typeof parsed.rewriteSuggestion === 'string' ? parsed.rewriteSuggestion : undefined,
  };
}

export async function detectGapsAcrossProject(
  documents: Array<{ id: string; name: string; content: string }>,
  sessions: Array<{ id: string; transcript: string; createdAt: Date }>
): Promise<Array<{ description: string; documentRef?: string }>> {
  const docContext = documents
    .map((d) => `Document "${d.name}" (ID: ${d.id}):\n${d.content}`)
    .join('\n\n---\n\n');

  const sessionContext = sessions
    .slice(0, 10)
    .map((s) => `Session ${s.id} (${s.createdAt.toISOString().split('T')[0]}):\n${s.transcript.slice(0, 800)}`)
    .join('\n\n---\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert narrative analyst who identifies specific gaps in storytelling material. Be extremely specific — not "you need more content" but "you described this person three times but never said what happened to them." Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Analyze all project material and identify specific gaps.

DOCUMENTS:
${docContext}

RECENT SESSIONS:
${sessionContext}

Return JSON: { "gaps": [{ "description": "specific gap", "documentRef": "document name or null" }] }`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
  });

  const result = parseAiJsonObject(response.choices[0].message.content);
  const gaps = Array.isArray(result.gaps) ? result.gaps : [];
  return gaps
    .map((g) => {
      if (!g || typeof g !== 'object' || Array.isArray(g)) return null;
      const description =
        typeof (g as { description?: unknown }).description === 'string'
          ? (g as { description: string }).description.trim()
          : '';
      const documentRefRaw = (g as { documentRef?: unknown }).documentRef;
      const documentRef = typeof documentRefRaw === 'string' ? documentRefRaw : undefined;
      if (!description) return null;
      return documentRef ? { description, documentRef } : { description };
    })
    .filter((g): g is { description: string; documentRef?: string } => g !== null);
}

export async function recognizePatternsAcrossProject(
  sessions: Array<{ id: string; transcript: string; createdAt: Date }>
): Promise<Array<{ description: string; sessionRefs: string[] }>> {
  const sessionContext = sessions
    .map((s) => `Session ${s.id} (${s.createdAt.toISOString().split('T')[0]}):\n${s.transcript.slice(0, 600)}`)
    .join('\n\n---\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You detect recurring themes, phrases, and dynamics across storytelling sessions. When two stories told weeks apart illustrate the same thing, you name the pattern. Be specific and insightful. Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Identify patterns across these sessions:

${sessionContext}

Return JSON: { "patterns": [{ "description": "pattern description", "sessionRefs": ["sessionId1", "sessionId2"] }] }`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = parseAiJsonObject(response.choices[0].message.content);
  const patterns = Array.isArray(result.patterns) ? result.patterns : [];
  return patterns
    .map((p) => {
      if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
      const description =
        typeof (p as { description?: unknown }).description === 'string'
          ? (p as { description: string }).description.trim()
          : '';
      const sessionRefsRaw = (p as { sessionRefs?: unknown }).sessionRefs;
      const sessionRefs = Array.isArray(sessionRefsRaw)
        ? sessionRefsRaw.filter((s): s is string => typeof s === 'string')
        : [];
      if (!description) return null;
      return { description, sessionRefs };
    })
    .filter((p): p is { description: string; sessionRefs: string[] } => p !== null);
}
