'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnalysisResult } from '@/lib/types';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, GlassCard, Container, PrimaryButton, SecondaryButton, Shell, StatusMessage } from '@/components/ui/primitives';
import { toneCopy } from '@/lib/copy/tone';

interface SpeechRecognitionResults {
  [key: number]: { [key: number]: { transcript: string } };
  length: number;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: SpeechRecognitionResults }) => void) | null;
  start(): void;
  stop(): void;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'analyzing' | 'done';

const annotationColors: Record<string, string> = {
  important: 'bg-neon-pink-dim border-neon-pink/30 text-neon-pink',
  connection: 'bg-neon-lime-dim border-neon-lime/30 text-neon-lime',
  unfinished: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  tangent:   'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
  pattern:   'bg-neon-purple-dim border-neon-purple/30 text-neon-purple',
};

const annotationIcons: Record<string, string> = {
  important: '⚡',
  connection: '🔗',
  unfinished: '🧵',
  tangent:   '↪️',
  pattern:   '🔁',
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

function RecordingControlCard({
  state,
  duration,
  onToggle,
}: {
  state: RecordingState;
  duration: number;
  onToggle: () => void;
}) {
  const isRecording = state === 'recording';

  return (
    <GlassCard className={`mb-6 text-center py-10 border ${isRecording ? 'border-neon-pink/30' : 'border-neon-lime/20'}`}>
      {/* Outer glow ring */}
      <div className="relative mx-auto mb-8 flex items-center justify-center" style={{ width: 144, height: 144 }}>
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-neon-pink/20 animate-ping" style={{ animationDuration: '1.6s' }} />
            <span className="absolute inset-[-12px] rounded-full border border-neon-pink/10" />
          </>
        )}
        {!isRecording && (
          <span className="absolute inset-[-12px] rounded-full border border-neon-lime/10 idle-glow-pulse" />
        )}
        <button
          onClick={onToggle}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 ${
            isRecording
              ? 'bg-neon-pink/15 border-2 border-neon-pink recording-pulse'
              : 'bg-neon-lime-dim border-2 border-neon-lime/50 hover:border-neon-lime idle-glow-pulse'
          }`}
        >
          {isRecording ? (
            /* Stop icon */
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
              <rect x="8" y="8" width="16" height="16" rx="3" fill="#ec4899" />
            </svg>
          ) : (
            /* Mic icon */
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
              <rect x="12" y="3" width="12" height="19" rx="6" stroke="#a3e635" strokeWidth="2" />
              <path d="M7 18c0 6.075 4.925 11 11 11s11-4.925 11-11" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" />
              <line x1="18" y1="29" x2="18" y2="34" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {isRecording ? (
        <div>
          {/* Neon waveform */}
          <div className="mb-4 flex items-end justify-center gap-1" style={{ height: 36 }}>
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="waveform-bar w-1.5 rounded-full bg-neon-pink"
                style={{
                  animationDelay: `${i * 0.09}s`,
                  minHeight: 5,
                  opacity: 0.75 + (i % 3) * 0.08,
                }}
              />
            ))}
          </div>
          <p className="text-2xl font-bold tabular-nums text-neon-pink tracking-wider">
            {formatDuration(duration)}
          </p>
          <p className="mt-2 text-sm text-app-fg-muted">Recording — tap to stop</p>
        </div>
      ) : (
        <div>
          <p className="text-xl font-semibold text-white">Tap to start talking</p>
          <p className="mt-2 text-sm text-app-fg-muted">Don&apos;t worry about structure. Say everything.</p>
        </div>
      )}
    </GlassCard>
  );
}

function AnalysisPanels({ analysis }: { analysis: AnalysisResult }) {
  return (
    <>
      {analysis.documentSuggestion && (
        <GlassCard className="border-neon-purple/20 bg-neon-purple-dim">
          <h2 className="mb-2 font-semibold text-neon-purple">
            Goes in: {analysis.documentSuggestion.documentName}
          </h2>
          <p className="text-sm text-app-fg-muted">{analysis.documentSuggestion.reason}</p>
        </GlassCard>
      )}

      {analysis.significance && (
        <GlassCard className="border-amber-500/25 bg-amber-500/5">
          <h2 className="mb-2 font-semibold text-amber-400">{toneCopy.recordAnalysisSignificanceTitle}</h2>
          <p className="text-sm text-app-fg">{analysis.significance}</p>
          {analysis.significanceDetails?.justification && (
            <p className="mt-2 text-xs text-app-fg-muted">{analysis.significanceDetails.justification}</p>
          )}
        </GlassCard>
      )}

      {analysis.tangents && analysis.tangents.length > 0 && (
        <Card className="border-amber-500/20">
          <h2 className="mb-3 font-semibold text-amber-400">You dropped these threads</h2>
          <div className="space-y-2.5">
            {analysis.tangents.map((t, i) => (
              <div key={i} className="rounded-xl bg-app-surface-muted p-3 border border-app-border">
                <p className="text-sm font-medium text-amber-300">{t.thread}</p>
                {t.context && <p className="mt-1 text-xs italic text-app-fg-muted">&quot;{t.context}&quot;</p>}
                {t.evidence && <p className="mt-1 text-xs text-app-fg-muted">Evidence: {t.evidence}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {analysis.contradictions && analysis.contradictions.length > 0 && (
        <GlassCard className="border-neon-pink/25 bg-neon-pink-dim">
          <h2 className="mb-3 font-semibold text-neon-pink">This conflicts with something</h2>
          <div className="space-y-2">
            {analysis.contradictions.map((c, i) => (
              <div key={i} className="rounded-xl bg-app-surface-muted p-3 border border-neon-pink/15">
                <p className="text-sm text-neon-pink/90">{c.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {analysis.questions && analysis.questions.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-white">{toneCopy.recordAnalysisQuestionsTitle}</h2>
          <ul className="space-y-2.5">
            {(analysis.questionDetails || analysis.questions.map((q) => ({ text: q, contextAnchor: '' }))).map((q, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 text-app-fg-muted tabular-nums shrink-0">{i + 1}.</span>
                <div>
                  <p className="text-neon-lime/90">{q.text}</p>
                  {q.contextAnchor && <p className="text-xs text-app-fg-muted mt-0.5">{q.contextAnchor}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {analysis.voicePreservedDraft && (
        <GlassCard className="border-neon-lime/20 bg-neon-lime-dim">
          <h2 className="mb-3 font-semibold text-neon-lime">In your voice</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-fg">{analysis.voicePreservedDraft}</p>
          {analysis.voicePreservedDraftDetails?.justification && (
            <p className="mt-2 text-xs text-app-fg-muted">{analysis.voicePreservedDraftDetails.justification}</p>
          )}
        </GlassCard>
      )}

      {analysis.annotations && analysis.annotations.length > 0 && (
        <Card className="border-neon-purple/20">
          <h2 className="mb-3 font-semibold text-neon-purple">AI Coach Notes</h2>
          <div className="space-y-2">
            {analysis.annotations.map((ann, i) => (
              <div
                key={`${ann.type}:${ann.reference ?? ''}:${ann.text}:${i}`}
                className={`rounded-xl border px-3 py-2.5 text-sm ${
                  annotationColors[ann.type] || 'border-app-border bg-app-surface-muted text-app-fg'
                }`}
              >
                <span className="mr-2">{annotationIcons[ann.type] || '💡'}</span>
                {ann.text}
                {ann.reference && <span className="ml-2 text-xs opacity-60">({ann.reference})</span>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

export default function RecordPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const questionId = searchParams.get('questionId');
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const processRecording = useCallback(async (blob: Blob) => {
    setState('processing');

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('projectId', id);
      if (questionId) formData.append('questionId', questionId);

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeRes.ok) {
        const data = (await transcribeRes.json()) as { error?: string };
        throw new Error(data.error || 'Transcription failed');
      }

      const { transcript: rawTranscript, sessionId: newSessionId } = await transcribeRes.json();
      setTranscript(rawTranscript);

      setState('analyzing');
      const analyzeRes = await fetch(`/api/projects/${id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: newSessionId, transcript: rawTranscript }),
      });

      if (analyzeRes.ok) {
        const analysisData = await analyzeRes.json();
        setAnalysis(analysisData);
      }

      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setState('idle');
    }
  }, [id, questionId]);

  const startRecording = useCallback(async () => {
    setError(null);
    setLiveTranscript('');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processRecording(blob);
      };

      mediaRecorder.start(1000);
      setState('recording');
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognitionAPI = (
          (window as unknown as Record<string, new () => BrowserSpeechRecognition>).SpeechRecognition ||
          (window as unknown as Record<string, new () => BrowserSpeechRecognition>).webkitSpeechRecognition
        );
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: { results: SpeechRecognitionResults }) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setLiveTranscript(text);
        };
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      setError('Could not access microphone. Please allow microphone access.');
      console.error(err);
    }
  }, [processRecording]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return (
    <Shell>
      <Container>
        <AppBackLink href={`/project/${id}`} />
        <div className="mt-4" />
        <AppHeader title="Voice Session" subtitle={toneCopy.recordHeaderSubtitle} />

        {error && <StatusMessage state="error" title="Recording error" description={error} />}

        {questionId && (
          <GlassCard className="border-neon-purple/25 mb-6">
            <p className="text-neon-purple text-sm">
              Prompted response — linked to question {questionId.slice(0, 8)}…
            </p>
          </GlassCard>
        )}

        {(state === 'idle' || state === 'recording') && (
          <RecordingControlCard
            state={state}
            duration={duration}
            onToggle={state === 'idle' ? startRecording : stopRecording}
          />
        )}

        {state === 'recording' && liveTranscript && (
          <GlassCard className="mb-6 border-neon-pink/15">
            <p className="mb-2 text-xs uppercase tracking-widest text-neon-pink/60">Live Transcript</p>
            <p className="text-sm leading-relaxed text-app-fg">{liveTranscript}</p>
          </GlassCard>
        )}

        {(state === 'processing' || state === 'analyzing') && (
          <StatusMessage
            state="loading"
            title={
              state === 'processing'
                ? toneCopy.recordLoadingTranscribeTitle
                : toneCopy.recordLoadingAnalyzeTitle
            }
            description={
              state === 'processing'
                ? toneCopy.recordLoadingTranscribeDescription
                : toneCopy.recordLoadingAnalyzeDescription
            }
          />
        )}

        {state === 'done' && (
          <div className="space-y-5">
            <GlassCard className="border-app-border">
              <h2 className="mb-3 font-semibold text-white flex items-center gap-2">
                Raw Transcript
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-fg">{transcript}</p>
            </GlassCard>

            {analysis && <AnalysisPanels analysis={analysis} />}

            {analysis?.contractValidation && !analysis.contractValidation.isValid && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <h2 className="mb-2 text-sm font-semibold text-amber-400">AI output contract issues</h2>
                <ul className="list-disc space-y-1 pl-4 text-xs text-amber-300/80">
                  {analysis.contractValidation.issues.map((issue, index) => (
                    <li key={`${issue}:${index}`}>{issue}</li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="flex gap-3">
              <PrimaryButton
                onClick={() => {
                  setState('idle');
                  setTranscript('');
                  setAnalysis(null);
                  setDuration(0);
                  setLiveTranscript('');
                }}
                className="flex-1 py-3"
              >
                Record Another Session
              </PrimaryButton>
              <Link href={`/project/${id}`} className="flex-1">
                <SecondaryButton className="w-full py-3">Back to Project</SecondaryButton>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </Shell>
  );
}
