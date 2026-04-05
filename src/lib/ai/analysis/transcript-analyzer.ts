import { openai } from '@/lib/ai/client';
import { asObject, asStringArray, parseAiJsonObjectStrict, safeString } from '@/lib/ai/parsing';
import { AnalysisResult } from '@/lib/types';

function normalizeAnalysis(value: unknown): { value: AnalysisResult; contractIssues: string[] } {
  const contractIssues: string[] = [];
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
          documentName: safeString(documentSuggestionRaw.documentName).trim(),
          reason: safeString(documentSuggestionRaw.reason).trim(),
        };
  if (documentSuggestion && (documentSuggestion.documentName.length === 0 || documentSuggestion.reason.length === 0)) {
    contractIssues.push('documentSuggestion must include non-empty documentName and reason');
  }

  const tangents = Array.isArray(parsed.tangents)
    ? parsed.tangents
        .map((entry) => asObject(entry))
        .map((entry, index) => {
          const thread = safeString(entry.thread).trim();
          const context = safeString(entry.context).trim();
          const evidence = safeString(entry.evidence).trim();
          if (!thread || !context || !evidence) {
            contractIssues.push(`tangents[${index}] must include thread, context, and evidence`);
            return null;
          }
          return { thread, context, evidence };
        })
        .filter((entry): entry is { thread: string; context: string; evidence: string } => entry !== null)
    : [];
  if (!Array.isArray(parsed.tangents)) {
    contractIssues.push('tangents must be an array');
  }

  const patterns = Array.isArray(parsed.patterns)
    ? parsed.patterns
        .map((entry) => asObject(entry))
        .map((entry, index) => {
          const description = safeString(entry.description).trim();
          const sessionRefs = asStringArray(entry.sessionRefs).map((s) => s.trim()).filter(Boolean);
          const evidence = safeString(entry.evidence).trim();
          if (!description || !evidence || sessionRefs.length === 0) {
            contractIssues.push(`patterns[${index}] must include description, evidence, and non-empty sessionRefs`);
            return null;
          }
          return {
            description,
            sessionRefs,
            evidence,
          };
        })
        .filter((entry): entry is { description: string; sessionRefs: string[]; evidence: string } => entry !== null)
    : [];
  if (!Array.isArray(parsed.patterns)) {
    contractIssues.push('patterns must be an array');
  }

  const gaps = Array.isArray(parsed.gaps)
    ? parsed.gaps
        .map((entry) => asObject(entry))
        .map((entry, index) => {
          const description = safeString(entry.description).trim();
          const documentRef = safeString(entry.documentRef).trim() || undefined;
          const whyItMatters = safeString(entry.whyItMatters).trim();
          if (!description || !whyItMatters) {
            contractIssues.push(`gaps[${index}] must include description and whyItMatters`);
            return null;
          }
          return {
            description,
            documentRef,
            whyItMatters,
          };
        })
        .filter((entry): entry is { description: string; documentRef?: string; whyItMatters: string } => entry !== null)
    : [];
  if (!Array.isArray(parsed.gaps)) {
    contractIssues.push('gaps must be an array');
  }

  const contradictions = Array.isArray(parsed.contradictions)
    ? parsed.contradictions
        .map((entry) => asObject(entry))
        .map((entry, index) => {
          const description = safeString(entry.description).trim();
          const existing = safeString(entry.existing).trim();
          const next = safeString(entry.new).trim();
          const reason = safeString(entry.reason).trim();
          if (!description || !existing || !next || !reason) {
            contractIssues.push(`contradictions[${index}] must include description, existing, new, and reason`);
            return null;
          }
          return {
            description,
            existing,
            new: next,
            reason,
          };
        })
        .filter(
          (entry): entry is { description: string; existing: string; new: string; reason: string } => entry !== null
        )
    : [];
  if (!Array.isArray(parsed.contradictions)) {
    contractIssues.push('contradictions must be an array');
  }

  const questionDetails = Array.isArray(parsed.questions)
    ? parsed.questions
        .map((entry) => asObject(entry))
        .map((entry, index) => {
          const text = safeString(entry.text).trim();
          const contextAnchor = safeString(entry.contextAnchor).trim();
          if (!text || !contextAnchor) {
            contractIssues.push(`questions[${index}] must include text and contextAnchor`);
            return null;
          }
          return { text, contextAnchor };
        })
        .filter((entry): entry is { text: string; contextAnchor: string } => entry !== null)
    : [];
  if (!Array.isArray(parsed.questions)) {
    contractIssues.push('questions must be an array');
  }
  const questions = questionDetails.map((entry) => entry.text);

  const concepts = Array.isArray(parsed.concepts)
    ? parsed.concepts
        .map((entry) => asObject(entry))
        .map((entry, index) => {
          if (entry.status !== 'developing' && entry.status !== 'complete' && entry.status !== 'contradicted') {
            contractIssues.push(`concepts[${index}].status must be developing|complete|contradicted`);
            return null;
          }

          const name = safeString(entry.name).trim();
          const definition = safeString(entry.definition).trim();
          if (!name || !definition) {
            contractIssues.push(`concepts[${index}] must include non-empty name and definition`);
            return null;
          }
          return {
            name,
            definition,
            sourceSession: safeString(entry.sourceSession).trim() || undefined,
            linkedDocument: safeString(entry.linkedDocument).trim() || undefined,
            status: entry.status,
          };
        })
        .filter(
          (entry): entry is {
            name: string;
            definition: string;
            sourceSession?: string;
            linkedDocument?: string;
            status: 'developing' | 'complete' | 'contradicted';
          } => entry !== null
        )
    : [];
  if (!Array.isArray(parsed.concepts)) {
    contractIssues.push('concepts must be an array');
  }

  const annotations = Array.isArray(parsed.annotations)
    ? parsed.annotations
        .map((entry) => asObject(entry))
        .map((entry, index) => {
          const type = entry.type;
          if (
            type !== 'important' &&
            type !== 'connection' &&
            type !== 'unfinished' &&
            type !== 'tangent' &&
            type !== 'pattern'
          ) {
            contractIssues.push(
              `annotations[${index}].type must be one of important|connection|unfinished|tangent|pattern`
            );
            return null;
          }
          const text = safeString(entry.text).trim();
          if (!text) {
            contractIssues.push(`annotations[${index}].text must be non-empty`);
            return null;
          }

          return {
            text,
            type,
            reference: safeString(entry.reference).trim() || undefined,
          };
        })
        .filter(
          (entry): entry is {
            text: string;
            type: 'important' | 'connection' | 'unfinished' | 'tangent' | 'pattern';
            reference?: string;
          } => entry !== null
        )
    : [];
  if (!Array.isArray(parsed.annotations)) {
    contractIssues.push('annotations must be an array');
  }

  const significanceDetailsRaw = asObject(parsed.significance);
  const significanceDetails = Object.keys(significanceDetailsRaw).length
    ? {
        text: safeString(significanceDetailsRaw.text).trim(),
        justification: safeString(significanceDetailsRaw.justification).trim(),
        confidence:
          typeof significanceDetailsRaw.confidence === 'number' &&
          Number.isFinite(significanceDetailsRaw.confidence) &&
          significanceDetailsRaw.confidence >= 0 &&
          significanceDetailsRaw.confidence <= 1
            ? significanceDetailsRaw.confidence
            : -1,
      }
    : undefined;
  if (significanceDetails) {
    if (!significanceDetails.text || !significanceDetails.justification || significanceDetails.confidence < 0) {
      contractIssues.push('significance must include text, justification, and confidence between 0 and 1');
    }
  }

  const voicePreservedDraftDetailsRaw = asObject(parsed.voicePreservedDraft);
  const voicePreservedDraftDetails = Object.keys(voicePreservedDraftDetailsRaw).length
    ? {
        draft: safeString(voicePreservedDraftDetailsRaw.draft).trim(),
        justification: safeString(voicePreservedDraftDetailsRaw.justification).trim(),
        confidence:
          typeof voicePreservedDraftDetailsRaw.confidence === 'number' &&
          Number.isFinite(voicePreservedDraftDetailsRaw.confidence) &&
          voicePreservedDraftDetailsRaw.confidence >= 0 &&
          voicePreservedDraftDetailsRaw.confidence <= 1
            ? voicePreservedDraftDetailsRaw.confidence
            : -1,
      }
    : undefined;
  if (voicePreservedDraftDetails) {
    if (
      !voicePreservedDraftDetails.draft ||
      !voicePreservedDraftDetails.justification ||
      voicePreservedDraftDetails.confidence < 0
    ) {
      contractIssues.push('voicePreservedDraft must include draft, justification, and confidence between 0 and 1');
    }
  }

  return {
    value: {
      contractValidation: {
        isValid: contractIssues.length === 0,
        issues: contractIssues,
      },
      documentSuggestion:
        documentSuggestion && documentSuggestion.documentName.length > 0 && documentSuggestion.reason.length > 0
          ? documentSuggestion
          : undefined,
      tangents,
      patterns,
      gaps,
      contradictions,
      questions,
      questionDetails,
      concepts,
      annotations,
      significance: significanceDetails?.text,
      significanceDetails:
        significanceDetails && significanceDetails.confidence >= 0 ? significanceDetails : undefined,
      voicePreservedDraft: voicePreservedDraftDetails?.draft,
      voicePreservedDraftDetails:
        voicePreservedDraftDetails && voicePreservedDraftDetails.confidence >= 0
          ? voicePreservedDraftDetails
          : undefined,
    },
    contractIssues,
  };
}

function buildFallbackAnalysis(): AnalysisResult {
  return {
    contractValidation: {
      isValid: false,
      issues: ['analysis unavailable'],
    },
    tangents: [],
    patterns: [],
    gaps: [],
    contradictions: [],
    questions: [],
    questionDetails: [],
    annotations: [],
    concepts: [],
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
      "context": "exact quote or paraphrase of where it was dropped",
      "evidence": "specific textual evidence that this thread was dropped"
    }
  ],
  "patterns": [
    {
      "description": "description of the recurring pattern",
      "sessionRefs": ["sessionId"],
      "evidence": "cross-session evidence for this pattern"
    }
  ],
  "gaps": [
    {
      "description": "specific gap description",
      "documentRef": "document name if relevant",
      "whyItMatters": "why this missing detail matters to the story"
    }
  ],
  "contradictions": [
    {
      "description": "what conflicts",
      "existing": "what was said before",
      "new": "what was just said",
      "reason": "why these claims conflict"
    }
  ],
  "questions": [
    {
      "text": "specific question 1",
      "contextAnchor": "quote or reference that motivated this question"
    },
    {
      "text": "specific question 2",
      "contextAnchor": "quote or reference that motivated this question"
    }
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
  "significance": {
    "text": "if the speaker minimized something important, name it explicitly here",
    "justification": "why this matters",
    "confidence": 0.0
  },
  "voicePreservedDraft": {
    "draft": "optional: a brief passage written in the speaker's actual voice based on this material",
    "justification": "why this preserves the speaker voice",
    "confidence": 0.0
  }
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

  const parsed = parseAiJsonObjectStrict<AnalysisResult>({
    content: response.choices[0].message.content,
    fallback: buildFallbackAnalysis(),
    label: 'analyzeTranscript',
    normalize: normalizeAnalysis,
  });

  return {
    ...parsed.value,
    contractValidation: {
      isValid: parsed.contractIssues.length === 0,
      issues: parsed.contractIssues,
      parseError: parsed.parseError,
    },
  };
}
