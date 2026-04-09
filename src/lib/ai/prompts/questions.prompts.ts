export const QUESTIONS_SYSTEM_PROMPT =
  'You are a skilled interviewer who asks questions that pull out the real story. Generate specific, pointed questions based on what the person has said — not generic prompts. Questions like "what happened right before that?" or "you mentioned X but never said what happened next." Return JSON only.';

export function buildQuestionsUserPrompt(params: {
  recentTranscriptContext: string;
  documentContext: string;
}): string {
  const { recentTranscriptContext, documentContext } = params;
  return (
    `Generate 8 specific questions for this project.\n\nRECENT TRANSCRIPTS:\n${recentTranscriptContext}\n\nDOCUMENTS:\n${documentContext}\n\n` +
    `Return JSON: { "questions": [{ "text": "question text", "sessionRef": null, "contextAnchor": "specific quote or reference to where this comes from" }] }`
  );
}
