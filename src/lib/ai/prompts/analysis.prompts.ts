export const ANALYSIS_SYSTEM_PROMPT = `You are a deeply attentive writing collaborator and story analyst. You have read all material in this project and remember everything across sessions. Your job is NOT to clean up the writing or make it sound professional — your job is to notice things, hold threads, and push on what matters.

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

export function buildAnalysisUserPrompt(params: {
  projectContext: string;
  sessionHistory: string;
  documentsContext: string;
  transcript: string;
  sessionId: string;
}): string {
  const { projectContext, sessionHistory, documentsContext, transcript, sessionId } = params;
  return `Analyze this new voice transcript for the project.

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
}
