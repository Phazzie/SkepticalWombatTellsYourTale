import { openai } from '@/lib/ai/client';
import { AI_MODELS, AI_TEMPERATURES, AI_TOKEN_BUDGETS } from '@/lib/ai/config';
import { asObject, asStringArray, parseAiJsonObjectStrict, safeString } from '@/lib/ai/parsing';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from '@/lib/ai/prompts/analysis.prompts';
import { withRetry } from '@/lib/ai/retry';
import { sanitizeForPrompt, truncateToTokenBudget } from '@/lib/ai/utils';
import { log } from '@/lib/server/logger';
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
          if (!thread) {
            contractIssues.push(`tangents[${index}].thread must be non-empty`);
          }
          if (!context) {
            contractIssues.push(`tangents[${index}].context must be non-empty`);
          }
          if (!evidence) {
            contractIssues.push(`tangents[${index}].evidence must be non-empty`);
          }
          if (!thread || !context || !evidence) {
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
          if (!description) {
            contractIssues.push(`patterns[${index}].description must be non-empty`);
          }
          if (sessionRefs.length === 0) {
            contractIssues.push(`patterns[${index}].sessionRefs must include at least one value`);
          }
          if (!evidence) {
            contractIssues.push(`patterns[${index}].evidence must be non-empty`);
          }
          if (!description || !evidence || sessionRefs.length === 0) {
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
          if (!description) {
            contractIssues.push(`gaps[${index}].description must be non-empty`);
          }
          if (!whyItMatters) {
            contractIssues.push(`gaps[${index}].whyItMatters must be non-empty`);
          }
          if (!description || !whyItMatters) {
            return null;
          }
          return {
            description,
            documentRef,
            whyItMatters,
          };
        })
        .filter(
          (entry): entry is { description: string; documentRef: string | undefined; whyItMatters: string } =>
            entry !== null
        )
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
          if (!description) {
            contractIssues.push(`contradictions[${index}].description must be non-empty`);
          }
          if (!existing) {
            contractIssues.push(`contradictions[${index}].existing must be non-empty`);
          }
          if (!next) {
            contractIssues.push(`contradictions[${index}].new must be non-empty`);
          }
          if (!reason) {
            contractIssues.push(`contradictions[${index}].reason must be non-empty`);
          }
          if (!description || !existing || !next || !reason) {
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
          if (!text) {
            contractIssues.push(`questions[${index}].text must be non-empty`);
          }
          if (!contextAnchor) {
            contractIssues.push(`questions[${index}].contextAnchor must be non-empty`);
          }
          if (!text || !contextAnchor) {
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
            sourceSession: string | undefined;
            linkedDocument: string | undefined;
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
            reference: string | undefined;
          } => entry !== null
        )
    : [];
  if (!Array.isArray(parsed.annotations)) {
    contractIssues.push('annotations must be an array');
  }

  const significanceDetailsRaw = asObject(parsed.significance);
  if (parsed.significance !== undefined && parsed.significance !== null && typeof parsed.significance !== 'object') {
    contractIssues.push('significance must be an object');
  }
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
  if (
    parsed.voicePreservedDraft !== undefined &&
    parsed.voicePreservedDraft !== null &&
    typeof parsed.voicePreservedDraft !== 'object'
  ) {
    contractIssues.push('voicePreservedDraft must be an object');
  }
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
  const safeTranscript = truncateToTokenBudget(sanitizeForPrompt(transcript), AI_TOKEN_BUDGETS.transcriptMaxChars);
  const safeProjectContext = sanitizeForPrompt(projectContext);
  const safeSessionHistory = truncateToTokenBudget(sanitizeForPrompt(sessionHistory), AI_TOKEN_BUDGETS.sessionHistoryMaxChars);
  const documentsContext = existingDocuments
    .map((d) => `Document "${d.name}":\n${d.content.slice(0, 500)}`)
    .join('\n\n');

  const systemPrompt = ANALYSIS_SYSTEM_PROMPT;
  const userPrompt = buildAnalysisUserPrompt({
    projectContext: safeProjectContext,
    sessionHistory: safeSessionHistory,
    documentsContext,
    transcript: safeTranscript,
    sessionId,
  });

  log('info', 'analyzeTranscript start', { model: AI_MODELS.chat, sessionId });
  const startTime = Date.now();
  let response: Awaited<ReturnType<typeof openai.chat.completions.create>>;
  try {
    response = await withRetry(() => openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: AI_TEMPERATURES.analysis,
    }));
    log('info', 'analyzeTranscript success', {
      model: response.model,
      durationMs: Date.now() - startTime,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
    });
  } catch (err) {
    log('error', 'analyzeTranscript failed', { sessionId, error: String(err), durationMs: Date.now() - startTime });
    return buildFallbackAnalysis();
  }

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
