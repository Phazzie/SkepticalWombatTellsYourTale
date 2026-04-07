'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnalysisResult } from '@/lib/types';
import { AppHeader } from '@/components/layout/app-header';
import { AppBackLink, Card, Container, PrimaryButton, SecondaryButton, Shell, StatusMessage } from '@/components/ui/primitives';
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
  important: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
  connection: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  unfinished: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  tangent: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
  pattern: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
};

const annotationIcons: Record<string, string> = {
  important: '⚡',
  connection: '🔗',
  unfinished: '🧵',
  tangent: '↪️',
  pattern: '🔁',
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
  return (
    <Card className="mb-6 text-center">
      <button
        className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full transition-all ${
          state === 'recording'
            ? 'recording-pulse bg-red-600 shadow-lg shadow-red-900'
            : 'bg-app-accent hover:brightness-110'
        }`}
        onClick={onToggle}
      >
        <span className="text-4xl">{state === 'recording' ? '⏹' : '🎙️'}</span>
      </button>

      {state === 'recording' ? (
        <div>
          <div className="mb-3 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="waveform-bar w-1 rounded-full bg-red-500"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-lg font-medium text-red-400">{formatDuration(duration)}</p>
          <p className="mt-1 text-sm text-app-fg-muted">Recording... tap to stop</p>
        </div>
      ) : (
        <div>
          <p className="text-xl font-medium text-white">Tap to start talking</p>
          <p className="mt-2 text-sm text-app-fg-muted">Don&apos;t worry about structure. Say everything.</p>
        </div>
      )}
    </Card>
  );
}

function AnalysisPanels({ analysis }: { analysis: AnalysisResult }) {
  return (
    <>
      {analysis.documentSuggestion && (
        <Card className="border-indigo-700 bg-indigo-900/30">
          <h2 className="mb-2 font-semibold text-indigo-300">📄 Goes in: {analysis.documentSuggestion.documentName}</h2>
          <p className="text-sm text-app-fg-muted">{analysis.documentSuggestion.reason}</p>
        </Card>
      )}

      {analysis.significance && (
        <Card className="border-amber-700 bg-amber-900/30">
          <h2 className="mb-2 font-semibold text-amber-300">{toneCopy.recordAnalysisSignificanceTitle}</h2>
          <p className="text-sm text-app-fg">{analysis.significance}</p>
          {analysis.significanceDetails?.justification && (
            <p className="mt-2 text-xs text-app-fg-muted">{analysis.significanceDetails.justification}</p>
          )}
        </Card>
      )}

      {analysis.tangents && analysis.tangents.length > 0 && (
        <Card className="border-amber-700/50">
          <h2 className="mb-3 font-semibold text-amber-400">🧵 You dropped these threads</h2>
          <div className="space-y-3">
            {analysis.tangents.map((t, i) => (
              <div key={i} className="rounded-lg bg-app-surface-muted p-3">
                <p className="text-sm font-medium text-amber-300">{t.thread}</p>
                {t.context && <p className="mt-1 text-xs italic text-app-fg-muted">&quot;{t.context}&quot;</p>}
                {t.evidence && <p className="mt-1 text-xs text-app-fg-muted">Evidence: {t.evidence}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {analysis.contradictions && analysis.contradictions.length > 0 && (
        <Card className="border-red-700/50 bg-red-900/20">
          <h2 className="mb-3 font-semibold text-red-400">⚠️ This conflicts with something</h2>
          <div className="space-y-3">
            {analysis.contradictions.map((c, i) => (
              <div key={i} className="rounded-lg bg-app-surface-muted p-3">
                <p className="text-sm text-red-300">{c.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {analysis.questions && analysis.questions.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-white">{toneCopy.recordAnalysisQuestionsTitle}</h2>
          <ul className="space-y-2">
            {(analysis.questionDetails || analysis.questions.map((q) => ({ text: q, contextAnchor: '' }))).map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-indigo-300">
                <span className="mt-0.5 text-app-fg-muted">{i + 1}.</span>
                <div>
                  <p>{q.text}</p>
                  {q.contextAnchor && <p className="text-xs text-app-fg-muted">{q.contextAnchor}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {analysis.voicePreservedDraft && (
        <Card className="border-green-700/50">
          <h2 className="mb-3 font-semibold text-green-400">✍️ In your voice</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-fg">{analysis.voicePreservedDraft}</p>
          {analysis.voicePreservedDraftDetails?.justification && (
            <p className="mt-2 text-xs text-app-fg-muted">{analysis.voicePreservedDraftDetails.justification}</p>
          )}
        </Card>
      )}

      {analysis.annotations && analysis.annotations.length > 0 && (
        <Card className="border-purple-700/50">
          <h2 className="mb-3 font-semibold text-purple-400">🤖 AI Coach Notes</h2>
          <div className="space-y-2">
            {analysis.annotations.map((ann, i) => (
              <div
                key={`${ann.type}:${ann.reference ?? ''}:${ann.text}:${i}`}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  annotationColors[ann.type] || 'border-app-border bg-app-surface-muted text-app-fg'
                }`}
              >
                <span className="mr-2">{annotationIcons[ann.type] || '💡'}</span>
                {ann.text}
                {ann.reference && <span className="ml-2 text-xs opacity-70">({ann.reference})</span>}
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
        const analysisData = await analyzeRes.json().catch((parseError) => {
          if (process.env.NODE_ENV === 'production') {
            console.error('[record] failed to parse analysis response');
          } else {
            console.error(parseError);
          }
          return null;
        });
        if (analysisData) {
          setAnalysis(analysisData);
        } else {
          setError('Analysis response was invalid. Transcript saved; retry later from Sessions.');
        }
      } else {
        const failure = (await analyzeRes.json().catch(() => null)) as { error?: string } | null;
        setError(failure?.error || 'Analysis failed. Transcript saved; retry later from Sessions.');
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
          <div className="bg-indigo-900/30 border border-indigo-700 rounded-xl p-4 mb-6">
            <p className="text-indigo-300 text-sm">
              Question response mode: this recording will be linked to question {questionId.slice(0, 8)}...
            </p>
          </div>
        )}

        {(state === 'idle' || state === 'recording') && (
          <RecordingControlCard
            state={state}
            duration={duration}
            onToggle={state === 'idle' ? startRecording : stopRecording}
          />
        )}

        {state === 'recording' && liveTranscript && (
          <Card className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-wide text-app-fg-muted">Live Transcript</p>
            <p className="text-sm leading-relaxed text-app-fg">{liveTranscript}</p>
          </Card>
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
          <div className="space-y-6">
            <Card>
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <span>📝</span> Raw Transcript
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-fg">{transcript}</p>
            </Card>

            {analysis && (
              <AnalysisPanels analysis={analysis} />
            )}

            {analysis?.contractValidation && !analysis.contractValidation.isValid && (
              <Card className="border-amber-700 bg-amber-900/20">
                <h2 className="mb-2 text-sm font-semibold text-amber-300">AI output contract issues</h2>
                <ul className="list-disc space-y-1 pl-4 text-xs text-amber-200">
                  {analysis.contractValidation.issues.map((issue, index) => (
                    <li key={`${issue}:${index}`}>{issue}</li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="flex gap-4">
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
