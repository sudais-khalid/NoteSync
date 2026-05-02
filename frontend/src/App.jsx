import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import AudioRecorder from './utils/audioRecorder';
import { lectureAPI, authAPI } from './services/api';
import RecordingControls from './components/RecordingControls';
import TranscriptDisplay from './components/TranscriptDisplay';
import SummaryDisplay from './components/SummaryDisplay';
import LectureHistory from './components/LectureHistory';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('record');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [lectureTitle, setLectureTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Other');
  const [tags, setTags] = useState('');
  const [recognitionLanguage, setRecognitionLanguage] = useState('en-IN');
  const [transcript, setTranscript] = useState('');
  const [rawTranscript, setRawTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [summary, setSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);

  const audioRecorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = authAPI.getCurrentUser();
      if (token && user) {
        try {
          const response = await authAPI.getMe();
          setCurrentUser(response.user);
          setIsAuthenticated(true);
        } catch {
          authAPI.logout();
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        authAPI.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!AudioRecorder.isSupported()) {
      setError('Speech recognition not supported. Please use Google Chrome.');
      return;
    }
    audioRecorderRef.current = new AudioRecorder();
    audioRecorderRef.current.setLanguage(recognitionLanguage);
    audioRecorderRef.current.setOnTranscriptUpdate((data) => {
      setTranscript(data.final);
      setRawTranscript(data.final);
      setInterimTranscript(data.interim);
    });
    audioRecorderRef.current.setOnError((err) => {
      if (err === 'not-allowed') setError('Microphone access denied. Please allow microphone permissions.');
    });
    fetchLectures();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRecorderRef.current && isRecording) audioRecorderRef.current.stop();
    };
  }, [isAuthenticated]);

  const handleLogin = (user) => { setCurrentUser(user); setIsAuthenticated(true); };
  const handleRegister = (user) => { setCurrentUser(user); setIsAuthenticated(true); };
  const handleLogout = () => { authAPI.logout(); setCurrentUser(null); setIsAuthenticated(false); setSelectedTab('record'); };
  const handleUpdateProfile = (user) => setCurrentUser(user);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-claude-bg">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-claude-orange flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-claude-dark font-semibold mb-3">Loading NoteSync...</p>
          <div className="w-7 h-7 border-2 border-claude-border border-t-claude-orange rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister
      ? <Register onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
      : <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
  }

  const fetchLectures = async () => {
    try {
      const response = await lectureAPI.getAllLectures();
      if (response.success) setLectures(response.lectures);
    } catch (e) { console.error('Error fetching lectures:', e); }
  };

  const handleLanguageChange = (lang) => {
    setRecognitionLanguage(lang);
    if (audioRecorderRef.current && !isRecording) audioRecorderRef.current.setLanguage(lang);
  };

  const handleStartRecording = () => {
    if (!lectureTitle.trim()) { setError('Please enter a lecture title before recording.'); return; }
    if (!audioRecorderRef.current) { setError('Audio recorder not initialized.'); return; }
    const started = audioRecorderRef.current.start();
    if (started) {
      setIsRecording(true); setIsPaused(false);
      setTranscript(''); setRawTranscript(''); setInterimTranscript('');
      setSummary(null); setRecordingTime(0); setError(null);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } else { setError('Could not start recording. Check microphone permissions.'); }
  };

  const handlePauseRecording = () => {
    if (audioRecorderRef.current && isRecording) { audioRecorderRef.current.pause(); setIsPaused(true); clearInterval(timerRef.current); }
  };

  const handleResumeRecording = () => {
    if (audioRecorderRef.current && isRecording && isPaused) {
      audioRecorderRef.current.resume(); setIsPaused(false);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    }
  };

  const handleStopRecording = () => {
    if (audioRecorderRef.current && isRecording) {
      audioRecorderRef.current.stop();
      setIsRecording(false); setIsPaused(false);
      clearInterval(timerRef.current);
      setRawTranscript(transcript);
    }
  };

  const handleSummarize = async () => {
    if (!transcript.trim()) { setError('No transcript available. Please record a lecture first.'); return; }
    setIsProcessing(true); setError(null);
    try {
      const response = await lectureAPI.summarize(transcript, subject);
      if (response.success) setSummary(response);
      else throw new Error(response.error || 'Summarization failed');
    } catch (e) { setError(e.message || 'Failed to summarize. Please try again.'); }
    finally { setIsProcessing(false); }
  };

  const handleSaveLecture = async () => {
    if (!transcript || !summary) { setError('Please transcribe and summarize before saving.'); return; }
    setIsSaving(true); setError(null);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const lectureData = {
        title: lectureTitle.trim() || `Lecture — ${new Date().toLocaleDateString()}`,
        rawTranscript,
        transcript,
        summary: summary.summary || '',
        keyPoints: summary.keyPoints || [],
        definitions: summary.definitions || [],
        examTopics: summary.examTopics || [],
        sentiment: summary.sentiment || 'neutral',
        entities: summary.entities || [],
        topics: summary.topics || [],
        readabilityScore: summary.readabilityScore || null,
        flashcards: summary.flashcards || [],
        subject: subject.trim(),
        category: category || 'Other',
        tags: tagsArray,
        duration: recordingTime,
      };
      const response = await lectureAPI.saveLecture(lectureData);
      if (response.success) { handleReset(); await fetchLectures(); setSelectedTab('history'); }
      else throw new Error(response.error || 'Save failed');
    } catch (e) { setError('Failed to save lecture. Please try again.'); }
    finally { setIsSaving(false); }
  };

  const handleDeleteLecture = async (id) => {
    try { await lectureAPI.deleteLecture(id); await fetchLectures(); }
    catch (e) { setError('Failed to delete lecture.'); }
  };

  const handleReset = () => {
    setLectureTitle(''); setSubject(''); setCategory('Other'); setTags('');
    setTranscript(''); setRawTranscript(''); setInterimTranscript('');
    setSummary(null); setRecordingTime(0); setError(null);
    if (audioRecorderRef.current) audioRecorderRef.current.clearTranscript();
  };

  const tabs = [
    { id: 'record', label: 'Record Lecture' },
    { id: 'history', label: `History (${lectures.length})` },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-claude-bg">
      <header className="bg-white border-b border-claude-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-claude-orange flex items-center justify-center flex-shrink-0">
                <svg className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-claude-dark leading-tight">NoteSync</h1>
                <p className="text-[11px] text-claude-muted hidden sm:block">AI-Powered Lecture Notes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!AudioRecorder.isSupported() && (
                <span className="hidden sm:block text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">Use Chrome</span>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-claude-dark">{currentUser?.fullName?.split(' ')[0]}</p>
                <p className="text-xs text-claude-muted">{currentUser?.university}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-claude-orange-light border border-claude-border flex items-center justify-center">
                <svg className="w-4 h-4 text-claude-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-3 animate-fade-in">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="flex gap-1 border-b border-claude-border">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                selectedTab === tab.id
                  ? 'border-claude-orange text-claude-orange'
                  : 'border-transparent text-claude-muted hover:text-claude-dark hover:border-claude-border'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {selectedTab === 'record' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <RecordingControls
                isRecording={isRecording} isPaused={isPaused} recordingTime={recordingTime}
                lectureTitle={lectureTitle} subject={subject} category={category} tags={tags}
                recognitionLanguage={recognitionLanguage}
                onLectureTitleChange={setLectureTitle} onSubjectChange={setSubject}
                onCategoryChange={setCategory} onTagsChange={setTags}
                onLanguageChange={handleLanguageChange} onStartRecording={handleStartRecording}
                onPauseRecording={handlePauseRecording} onResumeRecording={handleResumeRecording}
                onStopRecording={handleStopRecording}
              />
              {(transcript || summary) && !isRecording && (
                <button onClick={handleReset}
                  className="w-full text-sm text-claude-muted hover:text-claude-dark font-medium py-2.5 px-6 rounded-lg transition duration-200 border border-claude-border hover:bg-claude-border bg-white">
                  Start New Recording
                </button>
              )}
            </div>
            <div className="space-y-6">
              <div className="h-96">
                <TranscriptDisplay transcript={transcript} interimTranscript={interimTranscript}
                  isRecording={isRecording} onSummarize={handleSummarize} isProcessing={isProcessing} />
              </div>
              {summary && (
                <SummaryDisplay summary={summary} onSave={handleSaveLecture} isSaving={isSaving} />
              )}
            </div>
          </div>
        ) : selectedTab === 'history' ? (
          <LectureHistory lectures={lectures} onDelete={handleDeleteLecture} onRefresh={fetchLectures} />
        ) : (
          <UserProfile user={currentUser} onUpdate={handleUpdateProfile} onLogout={handleLogout} />
        )}
      </main>

      <footer className="border-t border-claude-border mt-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-claude-subtle text-xs">
            NoteSync &mdash; AI-powered lecture notes &middot; Built by Sudais Khalid &copy; 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;