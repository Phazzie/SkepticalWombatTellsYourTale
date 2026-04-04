import { openai } from '@/lib/ai/client';
import { asObject, asStringArray, parseAiJsonObject, safeString } from '@/lib/ai/parsing';
import { AnalysisResult } from '@/lib/types';

function normalizeAnalysis(value: unknown): AnalysisResult {
  const parsed = asObject(value);

  const documentSuggestionRaw = asObject(parsed.documentSuggestion);
  const documentSuggestion =
    Object.keys(documentSuggestionRaw).length === 0
      ? undefined
      : {
          documentId:
            typeof documentSuggestionRaw.documentId === 'string'
              ? documentSuggestionRaw.documentId
              : undefined,
          documentName: safeString(documentSuggestionRaw.documentName),
          reason: safeString(documentSuggestionRaw.reason),
        };

  const tangents = Array.isArray(parsed.tangents)
    ? parsed.tangents
        .map((entry) => asObject(entry))
        .map((entry) => ({ thread: safeString(entry.thread), context: safeString(entry.context) }))
        .filter((entry) => entry.thread.length > 0)
    : [];

  const patterns = Array.isArray(parsed.patterns)
    ? parsed.patterns
        .map((entry) => asObject(entry))
        .map((entry) => ({
          description: safeString(entry.description),
          sessionRefs: asStringArray(entry.sessionRefs),
        }))
        .filter((entry) => entry.description.length > 0)
    : [];

  const gaps = Array.isArray(parsed.gaps)
    ? parsed.gaps
        .map((entry) => asObject(entry))
        .map((entry) => ({
          description: safeString(entry.description),
          documentRef: safeString(entry.documentRef) || undefined,
        }))
        .filter((entry) => entry.description.length > 0)
    : [];

  const contradictions = Array.isArray(parsed.contradictions)
    ? parsed.contradictions
        .map((entry) => asObject(entry))
        .map((entry) => ({
          description: safeString(entry.description),
          existing: safeString(entry.existing),
          new: safeString(entry.new),
        }))
        .filter((entry) => entry.description.length > 0)
    : [];

  const questions = asStringArray(parsed.questions).filter((entry) => entry.trim().length > 0);

  const concepts = Array.isArray(parsed.concepts)
    ? parsed.concepts
        .map((entry) => asObject(entry))
        .map((entry) => {
          const status: 'developing' | 'complete' | 'contradicted' =
            entry.status === 'complete' || entry.status === 'contradicted'
              ? entry.status
              : 'developing';

          return {
            name: safeString(entry.name),
            definition: safeString(entry.definition),
            sourceSession: safeString(entry.sourceSession) || undefined,
            linkedDocument: safeString(entry.linkedDocument) || undefined,
            status,
          };
        })
        .filter((entry) => entry.name.length > 0 && entry.definition.length > 0)
    : [];

  const annotations = Array.isArray(parsed.annotations)
    ? parsed.annotations
        .map((entry) => asObject(entry))
        .map((entry) => {
          const type: 'important' | 'connection' | 'unfinished' | 'tangent' | 'pattern' =
            entry.type === 'important' ||
            entry.type === 'connection' ||
            entry.type === 'unfinished' ||
            entry.type === 'tangent' ||
            entry.type === 'pattern'
              ? entry.type
              : 'important';

          return {
            text: safeString(entry.text),
            type,
            reference: safeString(entry.reference) || undefined,
          };
        })
        .filter((entry) => entry.text.length > 0)
    : [];

  const significance = safeString(parsed.significance) || undefined;
  const voicePreservedDraft = safeString(parsed.voicePreservedDraft) || undefined;

  return {
    documentSuggestion,
    tangents,
    patterns,
    gaps,
    contradictions,
    questions,
    concepts,
    annotations,
    significance,
    voicePreservedDraft,
  };
}

export async function analyzeTranscript(
  transcript: string,
  projectContext: string,
  sessionHistory: string,
  existingDocuments: Array<{ id: string; name: string; content: string }>,
  sessionId: string
): Promise<AnalysisResult> {
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

  return parseAiJsonObject<AnalysisResult>({
    content: response.choices[0].message.content,
    fallback: {
      tangents: [],
      patterns: [],
      gaps: [],
      contradictions: [],
      questions: [],
      annotations: [],
      concepts: [],
    },
    label: 'analyzeTranscript',
    normalize: normalizeAnalysis,
  });
}
