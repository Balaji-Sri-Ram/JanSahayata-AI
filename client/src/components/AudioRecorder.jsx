import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, Volume2, Sparkles } from 'lucide-react';

export default function AudioRecorder({ onAudioReady, onAudioRemoved }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioElementRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const audioFile = new File([audioBlob], `voice-report-${Date.now()}.webm`, {
          type: 'audio/webm',
        });

        if (onAudioReady) {
          onAudioReady(audioFile, url);
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      setPermissionError('Microphone access was denied or not supported. Please check browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (onAudioRemoved) {
      onAudioRemoved();
    }
  };

  const handlePlayPause = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
          <Mic className="w-3.5 h-3.5 text-railway-600" />
          <span>Voice Report (Microphone Input)</span>
        </label>
        <span className="text-[11px] text-slate-400">
          Whisper STT Ready
        </span>
      </div>

      {permissionError && (
        <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {permissionError}
        </div>
      )}

      {!isRecording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white border border-slate-300 hover:border-railway-500 hover:bg-railway-50/50 text-slate-800 font-medium text-sm transition-all shadow-xs group"
        >
          <div className="w-8 h-8 rounded-full bg-railway-100 flex items-center justify-center text-railway-700 group-hover:bg-railway-600 group-hover:text-white transition-colors">
            <Mic className="w-4 h-4" />
          </div>
          <span>🎙 Record Voice Complaint</span>
        </button>
      )}

      {isRecording && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-red-50/80 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-sm font-semibold text-red-700">
              Recording Voice... {formatSeconds(recordingTime)}
            </span>

            {/* Simulated sound waves */}
            <div className="flex items-center gap-1 h-6 ml-2">
              <span className="w-1 bg-red-500 rounded-full animate-wave-1"></span>
              <span className="w-1 bg-red-500 rounded-full animate-wave-2"></span>
              <span className="w-1 bg-red-500 rounded-full animate-wave-3"></span>
              <span className="w-1 bg-red-500 rounded-full animate-wave-4"></span>
              <span className="w-1 bg-red-500 rounded-full animate-wave-5"></span>
            </div>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop Recording</span>
          </button>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="space-y-3 bg-white border border-slate-200 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Voice Note Recorded ({formatSeconds(recordingTime || 5)})</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              Ready for Submission
            </span>
          </div>

          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-9"
            controls
          />

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={deleteRecording}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={() => {
                deleteRecording();
                startRecording();
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Record Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
