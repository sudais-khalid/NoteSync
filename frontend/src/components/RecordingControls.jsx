import React from 'react';

const RecordingControls = ({
  isRecording, isPaused, recordingTime, lectureTitle, subject,
  category, tags, recognitionLanguage,
  onLectureTitleChange, onSubjectChange, onCategoryChange, onTagsChange,
  onLanguageChange, onStartRecording, onPauseRecording, onResumeRecording, onStopRecording,
}) => {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const inputClass = "w-full px-3.5 py-2.5 border border-claude-border rounded-lg text-sm text-claude-dark placeholder-claude-subtle focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition bg-white disabled:bg-claude-bg disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-claude-dark mb-1.5";

  return (
    <div className="bg-white rounded-xl border border-claude-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-claude-orange-light flex items-center justify-center">
          <svg className="w-4 h-4 text-claude-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-claude-dark">Record Lecture</h2>
      </div>

      <div className="space-y-4">
        {/* Lecture Title */}
        <div>
          <label className={labelClass}>Lecture title <span className="text-claude-orange">*</span></label>
          <input type="text" value={lectureTitle} onChange={(e) => onLectureTitleChange(e.target.value)}
            placeholder="e.g., Introduction to Machine Learning"
            disabled={isRecording} className={inputClass} />
        </div>

        {/* Subject */}
        <div>
          <label className={labelClass}>Subject</label>
          <input type="text" value={subject} onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="e.g., Computer Science"
            disabled={isRecording} className={inputClass} />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category</label>
          <select value={category} onChange={(e) => onCategoryChange(e.target.value)}
            disabled={isRecording}
            className="w-full px-3.5 py-2.5 border border-claude-border rounded-lg text-sm text-claude-dark focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition cursor-pointer bg-white disabled:bg-claude-bg disabled:cursor-not-allowed">
            <option value="Other">Select category</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Engineering">Engineering</option>
            <option value="Business">Business</option>
            <option value="Arts">Arts</option>
            <option value="Languages">Languages</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass}>Tags <span className="text-claude-subtle font-normal">(comma-separated)</span></label>
          <input type="text" value={tags} onChange={(e) => onTagsChange(e.target.value)}
            placeholder="e.g., AI, Machine Learning, Neural Networks"
            disabled={isRecording} className={inputClass} />
        </div>

        {/* Language */}
        <div>
          <label className={labelClass}>Recognition language</label>
          <select value={recognitionLanguage} onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isRecording}
            className="w-full px-3.5 py-2.5 border border-claude-border rounded-lg text-sm text-claude-dark focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition cursor-pointer bg-white disabled:bg-claude-bg disabled:cursor-not-allowed">
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="ur-PK">Urdu (Pakistan)</option>
          </select>
        </div>

        {/* Timer Display */}
        <div className="bg-claude-bg rounded-xl p-5 text-center border border-claude-border">
          <div className="text-4xl font-mono font-bold text-claude-dark tracking-wider mb-2">
            {formatTime(recordingTime)}
          </div>
          {isRecording && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
              <span className={`text-xs font-semibold tracking-widest uppercase ${isPaused ? 'text-amber-600' : 'text-red-600'}`}>
                {isPaused ? 'Paused' : 'Recording'}
              </span>
            </div>
          )}
          {!isRecording && recordingTime === 0 && (
            <p className="text-claude-subtle text-xs mt-1">Ready to record</p>
          )}
        </div>

        {/* Recording Buttons */}
        <div className="space-y-2.5 pt-1">
          {!isRecording ? (
            <button onClick={onStartRecording} disabled={!lectureTitle.trim()}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-claude-border disabled:text-claude-subtle disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2.5 shadow-sm text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
              Start Recording
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={isPaused ? onResumeRecording : onPauseRecording}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                {isPaused ? (
                  <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Resume</>
                ) : (
                  <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> Pause</>
                )}
              </button>
              <button onClick={onStopRecording}
                className="bg-claude-dark hover:bg-black text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                Stop
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        {!isRecording && (
          <div className="mt-2 p-3.5 bg-claude-bg rounded-lg border border-claude-border text-xs text-claude-muted space-y-1">
            <p className="font-semibold text-claude-dark mb-1.5">Tips for best results</p>
            <p>Speak clearly at a moderate pace</p>
            <p>Use a good microphone and minimize background noise</p>
            <p>Use Google Chrome for best speech recognition support</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingControls;