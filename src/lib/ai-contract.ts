import type { AIAnnotation, AnalysisResult } from '@/lib/types';
import { safeParseJson } from '@/lib/api-contract';

type UnknownObject = Record<string, unknown>;

const VALID_ANNOTATION_TYPES = new Set([
  'important',
  'connection',
  'unfinished',
  'tangent',
  'pattern',
]);

function isObject(value: unknown): value is UnknownObject {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function normalizeAnnotation(value: unknown): AIAnnotation | null {
  if (!isObject(value)) return null;
  const type = asString(value.type);
  if (!VALID_ANNOTATION_TYPES.has(type)) return null;
  const text = asString(value.text).trim();
  if (!text) return null;

  const timestampRaw = value.timestamp;
  const timestamp =
    typeof timestampRaw === 'number' && Number.isFinite(timestampRaw)
      ? timestampRaw
      : undefined;

  return {
    text,
    type: type as AIAnnotation['type'],
    reference: asOptionalString(value.reference),
    ...(timestamp !== undefined && { timestamp }),
  };
}

function normalizeAnalysisResult(value: unknown): AnalysisResult {
  const root = isObject(value) ? value : {};

  const tangents = Array.isArray(root.tangents)
    ? root.tangents
        .map((t) => {
          if (!isObject(t)) return null;
          const thread = asString(t.thread).trim();
          if (!thread) return null;
          return { thread, context: asString(t.context), evidence: asString(t.evidence) };
        })
        .filter((t): t is { thread: string; context: string; evidence: string } => t !== null)
    : [];

  const patterns = Array.isArray(root.patterns)
    ? root.patterns
        .map((p) => {
          if (!isObject(p)) return null;
          const description = asString(p.description).trim();
          if (!description) return null;
          const sessionRefs = Array.isArray(p.sessionRefs)
            ? p.sessionRefs.filter((s): s is string => typeof s === 'string')
            : [];
          return { description, sessionRefs, evidence: asString(p.evidence) };
        })
        .filter((p): p is { description: string; sessionRefs: string[]; evidence: string } => p !== null)
    : [];

  const gaps = Array.isArray(root.gaps)
    ? root.gaps
        .map((g) => {
          if (!isObject(g)) return null;
          const description = asString(g.description).trim();
          if (!description) return null;
          const documentRef = asOptionalString(g.documentRef);
          const whyItMatters = asString(g.whyItMatters);
          return documentRef ? { description, documentRef, whyItMatters } : { description, whyItMatters };
        })
        .filter((g): g is { description: string; documentRef?: string; whyItMatters: string } => g !== null)
    : [];

  const contradictions = Array.isArray(root.contradictions)
    ? root.contradictions
        .map((c) => {
          if (!isObject(c)) return null;
          const description = asString(c.description).trim();
          const existing = asString(c.existing).trim();
          const next = asString(c.new).trim();
          const reason = asString(c.reason).trim();
          if (!description || !existing || !next) return null;
          return { description, existing, new: next, reason };
        })
        .filter(
          (c): c is { description: string; existing: string; new: string; reason: string } => c !== null
        )
    : [];

  const questions = Array.isArray(root.questions)
    ? root.questions
        .filter((q): q is string => typeof q === 'string')
        .map((q) => q.trim())
        .filter(Boolean)
    : [];

  const annotations = Array.isArray(root.annotations)
    ? root.annotations
        .map((a) => normalizeAnnotation(a))
        .filter((a): a is AIAnnotation => a !== null)
    : [];

  const documentSuggestion = isObject(root.documentSuggestion)
    ? (() => {
        const documentName = asString(root.documentSuggestion.documentName).trim();
        const reason = asString(root.documentSuggestion.reason).trim();
        if (!documentName || !reason) return undefined;
        const documentId = asOptionalString(root.documentSuggestion.documentId);
        return documentId
          ? { documentId, documentName, reason }
          : { documentName, reason };
      })()
    : undefined;

  const significance = asOptionalString(root.significance);
  const voicePreservedDraft = asOptionalString(root.voicePreservedDraft);

  return {
    tangents,
    patterns,
    gaps,
    contradictions,
    questions,
    annotations,
    ...(documentSuggestion ? { documentSuggestion } : {}),
    ...(significance ? { significance } : {}),
    ...(voicePreservedDraft ? { voicePreservedDraft } : {}),
  };
}

export function parseAiJsonObject(content: string | null | undefined): UnknownObject {
  return safeParseJson<UnknownObject>(content ?? '{}', {});
}

export function normalizeAnalysisFromContent(content: string | null | undefined): AnalysisResult {
  return normalizeAnalysisResult(parseAiJsonObject(content));
}

export function normalizeQuestionsFromContent(
  content: string | null | undefined
): Array<{ text: string; sessionRef: string | null; createdAt: string }> {
  const parsed = parseAiJsonObject(content);
  const questionsRaw = Array.isArray(parsed.questions) ? parsed.questions : [];
  return questionsRaw
    .map((q) => {
      if (!isObject(q)) return null;
      const text = asString(q.text).trim();
      if (!text) return null;
      const sessionRef = typeof q.sessionRef === 'string' ? q.sessionRef : null;
      return {
        text,
        sessionRef,
        createdAt: new Date().toISOString(),
      };
    })
    .filter((q): q is { text: string; sessionRef: string | null; createdAt: string } => q !== null);
}
