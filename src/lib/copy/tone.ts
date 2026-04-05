export type ToneProfile = 'default' | 'unconventional' | 'reflective';

export const toneProfile: ToneProfile = 'unconventional';

type ToneCopy = {
  homeSubtitle: string;
  homeEmptyProjectsTitle: string;
  homeEmptyProjectsDescription: string;
  homeLoadingProjects: string;
  recordHeaderSubtitle: string;
  recordLoadingTranscribeTitle: string;
  recordLoadingTranscribeDescription: string;
  recordLoadingAnalyzeTitle: string;
  recordLoadingAnalyzeDescription: string;
  recordAnalysisSignificanceTitle: string;
  recordAnalysisQuestionsTitle: string;
  questionsIntro: string;
  questionsEmpty: string;
  sessionsLoading: string;
  sessionsEmptyTitle: string;
  sessionsEmptyDescription: string;
  dashboardDroppedThreadsEmpty: string;
  dashboardGapsEmpty: string;
  dashboardPatternsEmpty: string;
};

const copyByTone: Record<ToneProfile, ToneCopy> = {
  default: {
    homeSubtitle: 'Tell Your Tale. The AI that makes your thinking harder.',
    homeEmptyProjectsTitle: 'No projects yet',
    homeEmptyProjectsDescription: 'Create your first project to start talking.',
    homeLoadingProjects: 'Loading projects...',
    recordHeaderSubtitle: 'Capture raw thought, then let AI trace threads and patterns.',
    recordLoadingTranscribeTitle: 'Transcribing...',
    recordLoadingTranscribeDescription: 'Turning your voice into raw text',
    recordLoadingAnalyzeTitle: 'AI is reading your session...',
    recordLoadingAnalyzeDescription: 'Connecting this session to your broader project context',
    recordAnalysisSignificanceTitle: '⚡ What the AI noticed',
    recordAnalysisQuestionsTitle: '❓ Questions for next time',
    questionsIntro:
      "These are specific questions based on what you've said — not generic prompts. Answer any of them by recording a new voice session.",
    questionsEmpty: 'No questions yet.',
    sessionsLoading: 'Loading sessions...',
    sessionsEmptyTitle: 'No sessions yet',
    sessionsEmptyDescription: 'Record your first session to get started.',
    dashboardDroppedThreadsEmpty: 'No dropped threads yet.',
    dashboardGapsEmpty: 'No gaps detected yet. Add more sessions.',
    dashboardPatternsEmpty: 'No patterns detected yet.',
  },
  unconventional: {
    homeSubtitle: 'Tell Your Tale. The AI that chases what you almost skipped.',
    homeEmptyProjectsTitle: 'No story threads yet',
    homeEmptyProjectsDescription: 'Start a project and talk in fragments — we’ll hold the threads.',
    homeLoadingProjects: 'Gathering your projects...',
    recordHeaderSubtitle: 'Speak freely. The AI will map loose ends, pressure points, and echoes.',
    recordLoadingTranscribeTitle: 'Capturing your words...',
    recordLoadingTranscribeDescription: 'Turning live voice into raw, editable text',
    recordLoadingAnalyzeTitle: 'Tracing your threads...',
    recordLoadingAnalyzeDescription: 'Cross-checking this session against your full project memory',
    recordAnalysisSignificanceTitle: '⚡ What might matter more than it sounded',
    recordAnalysisQuestionsTitle: '❓ Questions worth following',
    questionsIntro:
      "These prompts are anchored in what you actually said. Pick one, record again, and push the story past the vague parts.",
    questionsEmpty: 'No anchored questions yet.',
    sessionsLoading: 'Opening your session history...',
    sessionsEmptyTitle: 'No captured sessions yet',
    sessionsEmptyDescription: 'Record one session and we’ll start building your trail of evidence.',
    dashboardDroppedThreadsEmpty: 'No dropped threads detected yet.',
    dashboardGapsEmpty: 'No unresolved gaps yet. More sessions reveal more specifics.',
    dashboardPatternsEmpty: 'No cross-session patterns yet.',
  },
  reflective: {
    homeSubtitle: 'Tell Your Tale. The AI that helps you notice what repeats.',
    homeEmptyProjectsTitle: 'No projects yet',
    homeEmptyProjectsDescription: 'Create a project when you’re ready to begin.',
    homeLoadingProjects: 'Loading your workspace...',
    recordHeaderSubtitle: 'Capture your thoughts naturally, then review what surfaced.',
    recordLoadingTranscribeTitle: 'Transcribing your session...',
    recordLoadingTranscribeDescription: 'Converting voice into raw transcript',
    recordLoadingAnalyzeTitle: 'Analyzing your session...',
    recordLoadingAnalyzeDescription: 'Linking this session to your existing material',
    recordAnalysisSignificanceTitle: '⚡ What stood out',
    recordAnalysisQuestionsTitle: '❓ Questions to revisit',
    questionsIntro:
      "These questions are based on your recent material. Use them to deepen your next recording.",
    questionsEmpty: 'No questions yet.',
    sessionsLoading: 'Loading sessions...',
    sessionsEmptyTitle: 'No sessions yet',
    sessionsEmptyDescription: 'Record your first session to get started.',
    dashboardDroppedThreadsEmpty: 'No dropped threads yet.',
    dashboardGapsEmpty: 'No gaps detected yet.',
    dashboardPatternsEmpty: 'No patterns detected yet.',
  },
};

export const toneCopy = copyByTone[toneProfile];
