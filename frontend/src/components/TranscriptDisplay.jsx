import React, { useRef, useEffect } from 'react';

const TranscriptDisplay = ({ transcript, interimTranscript, isRecording, onSummarize, isProcessing }) => {
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimTranscript]);

  const wordCount = transcript ? transcript.split(/\s+/).filter(w => w.length > 0).length : 0;
  const hasContent = transcript || interimTranscript;

  return (
    <div className="bg-white rounded-xl border border-claude-border h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-claude-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-claude-orange-light flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-claude-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-claude-dark">Live Transcript</h2>
        </div>

        {transcript && !isRecording && (
          <button onClick={onSummarize} disabled={isProcessing}
            className="bg-claude-orange hover:bg-claude-orange-dark disabled:bg-claude-border disabled:cursor-not-allowed text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg transition flex items-center gap-1.5">
            {isProcessing ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analysing...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Summarize
              </>
            )}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col px-5 py-4">
        {!hasContent ? (
          <div className="flex-1 flex items-center justify-center text-claude-muted border-2 border-dashed border-claude-border rounded-lg">
            <div className="text-center p-8">
              <svg className="w-10 h-10 mx-auto mb-3 text-claude-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-sm font-medium mb-1">Start recording to see transcript</p>
              <p className="text-xs text-claude-subtle">Your lecture will be transcribed in real-time</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-claude-bg rounded-lg p-4 overflow-y-auto border border-claude-border text-sm leading-relaxed">
            {transcript && (
              <p className="text-claude-dark whitespace-pre-wrap">{transcript}</p>
            )}
            {interimTranscript && isRecording && (
              <p className="text-claude-subtle italic mt-1">{interimTranscript}</p>
            )}
            <div ref={transcriptEndRef} />
          </div>
        )}

        {/* Footer status */}
        <div className="flex items-center justify-between mt-2.5 flex-shrink-0">
          {isRecording ? (
            <div className="flex items-center gap-1.5 text-xs text-claude-muted">
              <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
              Listening...
            </div>
          ) : <div />}
          {wordCount > 0 && (
            <span className="text-xs text-claude-subtle">{wordCount} words</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptDisplay;