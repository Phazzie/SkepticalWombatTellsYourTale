'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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

interface AnalysisResult {
  documentSuggestion?: { documentName: string; reason: string };
  tangents?: Array<{ thread: string; context: string }>;
  questions?: string[];
  significance?: string;
  contradictions?: Array<{ description: string }>;
  annotations?: Array<{ text: string; type: string }>;
  gaps?: Array<{ description: string }>;
  voicePreservedDraft?: string;
}

export default function RecordPage() {
  const { id } = useParams<{ id: string }>();
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

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeRes.ok) throw new Error('Transcription failed');
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
  }, [id]);

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

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/project/${id}`} className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Voice Session</h1>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {(state === 'idle' || state === 'recording') && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center mb-6">
            <div
              className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center cursor-pointer transition-all ${
                state === 'recording'
                  ? 'bg-red-600 recording-pulse shadow-lg shadow-red-900'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              onClick={state === 'idle' ? startRecording : stopRecording}
            >
              <span className="text-4xl">{state === 'recording' ? '⏹' : '🎙️'}</span>
            </div>

            {state === 'recording' && (
              <div>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="waveform-bar w-1 bg-red-500 rounded-full"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="text-red-400 font-medium text-lg">{formatDuration(duration)}</p>
                <p className="text-gray-500 text-sm mt-1">Recording... tap to stop</p>
              </div>
            )}

            {state === 'idle' && (
              <div>
                <p className="text-xl font-medium text-gray-200">Tap to start talking</p>
                <p className="text-gray-500 text-sm mt-2">
                  Just talk. Don&apos;t worry about structure. Say everything.
                </p>
              </div>
            )}
          </div>
        )}

        {state === 'recording' && liveTranscript && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Live Transcript</p>
            <p className="text-gray-300 text-sm leading-relaxed">{liveTranscript}</p>
          </div>
        )}

        {(state === 'processing' || state === 'analyzing') && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-600 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl animate-spin">⚙️</span>
            </div>
            <p className="text-lg font-medium text-white">
              {state === 'processing' ? 'Transcribing...' : 'AI is reading your session...'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {state === 'processing'
                ? 'Turning your voice into raw text'
                : "Connecting this to everything you've said before"}
            </p>
          </div>
        )}

        {state === 'done' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span>📝</span> Raw Transcript
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{transcript}</p>
            </div>

            {analysis && (
              <>
                {analysis.documentSuggestion && (
                  <div className="bg-indigo-900/30 border border-indigo-700 rounded-xl p-5">
                    <h2 className="font-semibold text-indigo-300 mb-2">📄 Goes in: {analysis.documentSuggestion.documentName}</h2>
                    <p className="text-gray-400 text-sm">{analysis.documentSuggestion.reason}</p>
                  </div>
                )}

                {analysis.significance && (
                  <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-5">
                    <h2 className="font-semibold text-amber-300 mb-2">⚡ What the AI noticed</h2>
                    <p className="text-gray-300 text-sm">{analysis.significance}</p>
                  </div>
                )}

                {analysis.tangents && analysis.tangents.length > 0 && (
                  <div className="bg-gray-900 border border-amber-700/50 rounded-xl p-5">
                    <h2 className="font-semibold text-amber-400 mb-3">🧵 You dropped these threads</h2>
                    <div className="space-y-3">
                      {analysis.tangents.map((t, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3">
                          <p className="text-sm font-medium text-amber-300">{t.thread}</p>
                          {t.context && (
                            <p className="text-xs text-gray-500 mt-1 italic">&quot;{t.context}&quot;</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.contradictions && analysis.contradictions.length > 0 && (
                  <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-5">
                    <h2 className="font-semibold text-red-400 mb-3">⚠️ This conflicts with something</h2>
                    <div className="space-y-3">
                      {analysis.contradictions.map((c, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3">
                          <p className="text-sm text-red-300">{c.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.questions && analysis.questions.length > 0 && (
                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
                    <h2 className="font-semibold text-white mb-3">❓ Questions for next time</h2>
                    <ul className="space-y-2">
                      {analysis.questions.map((q, i) => (
                        <li key={i} className="text-sm text-indigo-300 flex items-start gap-2">
                          <span className="text-gray-600 mt-0.5">{i + 1}.</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.voicePreservedDraft && (
                  <div className="bg-gray-900 border border-green-700/50 rounded-xl p-5">
                    <h2 className="font-semibold text-green-400 mb-3">✍️ In your voice</h2>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {analysis.voicePreservedDraft}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setState('idle');
                  setTranscript('');
                  setAnalysis(null);
                  setDuration(0);
                  setLiveTranscript('');
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Record Another Session
              </button>
              <Link
                href={`/project/${id}`}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors text-center"
              >
                Back to Project
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
