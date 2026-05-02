import React, { useState } from 'react';

const sentimentConfig = {
  positive: { label: 'Positive', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  neutral:  { label: 'Neutral',  bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200'  },
  critical: { label: 'Critical', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'  },
  mixed:    { label: 'Mixed',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'   },
};

const LectureHistory = ({ lectures, onDelete, onRefresh }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState({}); // per-lecture tab: 'notes' | 'raw'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  const formatTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
  };

  const formatDate = (d) => {
    const date = new Date(d), now = new Date();
    const diff = Math.floor(Math.abs(now - date) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTab = (id) => activeTab[id] || 'notes';
  const setTab = (id, tab) => setActiveTab(prev => ({ ...prev, [id]: tab }));

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) onDelete(id);
  };

  const filteredLectures = lectures.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || l.category === selectedCategory;
    const matchTag = selectedTag === 'all' || (l.tags && l.tags.includes(selectedTag));
    return matchSearch && matchCat && matchTag;
  });

  const categories = ['all', ...new Set(lectures.map(l => l.category).filter(Boolean))];
  const allTags = ['all', ...new Set(lectures.flatMap(l => l.tags || []))];

  const inputClass = "w-full px-3.5 py-2.5 border border-claude-border rounded-lg text-sm text-claude-dark placeholder-claude-subtle focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition bg-white";

  return (
    <div className="bg-white rounded-xl border border-claude-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-claude-orange-light flex items-center justify-center">
            <svg className="w-4 h-4 text-claude-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-claude-dark">Saved Lectures <span className="text-claude-muted font-normal">({lectures.length})</span></h2>
        </div>
        <button onClick={onRefresh}
          className="text-xs font-medium text-claude-orange border border-claude-border hover:border-claude-orange hover:bg-claude-orange-light px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className="w-4 h-4 text-claude-subtle absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lectures by title or subject..."
            className={inputClass + ' pl-10'} />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-claude-muted mb-1">Category</label>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2 border border-claude-border rounded-lg text-sm text-claude-dark focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition cursor-pointer bg-white">
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-claude-muted mb-1">Tag</label>
          <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}
            className="w-full px-3.5 py-2 border border-claude-border rounded-lg text-sm text-claude-dark focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition cursor-pointer bg-white">
            {allTags.map(t => <option key={t} value={t}>{t === 'all' ? 'All Tags' : t}</option>)}
          </select>
        </div>
      </div>

      {/* Active filters */}
      {(selectedCategory !== 'all' || selectedTag !== 'all' || searchQuery) && (
        <div className="mb-4 flex flex-wrap gap-2 items-center text-xs">
          <span className="text-claude-muted font-medium">Filters:</span>
          {searchQuery && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-claude-bg border border-claude-border rounded-full text-claude-dark">
              "{searchQuery}" <button onClick={() => setSearchQuery('')} className="text-claude-subtle hover:text-red-500 ml-0.5">×</button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-claude-orange-light border border-orange-200 rounded-full text-claude-orange">
              {selectedCategory} <button onClick={() => setSelectedCategory('all')} className="hover:text-red-500 ml-0.5">×</button>
            </span>
          )}
          {selectedTag !== 'all' && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700">
              {selectedTag} <button onClick={() => setSelectedTag('all')} className="hover:text-red-500 ml-0.5">×</button>
            </span>
          )}
          <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedTag('all'); }}
            className="text-red-500 hover:text-red-700 font-medium">Clear all</button>
        </div>
      )}

      {/* Lectures list */}
      {filteredLectures.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-claude-border rounded-xl">
          <svg className="w-10 h-10 mx-auto mb-3 text-claude-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium text-claude-muted mb-1">
            {searchQuery || selectedCategory !== 'all' || selectedTag !== 'all' ? 'No matching lectures' : 'No saved lectures yet'}
          </p>
          <p className="text-xs text-claude-subtle">
            {searchQuery || selectedCategory !== 'all' || selectedTag !== 'all' ? 'Try adjusting your filters' : 'Start recording your first lecture'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLectures.map((lecture) => {
            const sentiment = sentimentConfig[lecture.sentiment] || sentimentConfig.neutral;
            const tab = getTab(lecture._id);
            return (
              <div key={lecture._id} className="border border-claude-border rounded-xl overflow-hidden hover:border-claude-orange transition-colors duration-200">
                {/* Lecture row */}
                <div className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-claude-dark mb-1.5 truncate">{lecture.title}</h3>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-claude-muted mb-2">
                        <span>{formatDate(lecture.date)}</span>
                        {lecture.subject && <span>· {lecture.subject}</span>}
                        {lecture.duration > 0 && <span>· {formatTime(lecture.duration)}</span>}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {lecture.category && lecture.category !== 'Other' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-claude-orange-light text-claude-orange border border-orange-200">
                            {lecture.category}
                          </span>
                        )}
                        {lecture.sentiment && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${sentiment.bg} ${sentiment.text} ${sentiment.border}`}>
                            {sentiment.label}
                          </span>
                        )}
                        {lecture.readabilityScore && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                            Grade {lecture.readabilityScore}
                          </span>
                        )}
                        {lecture.tags && lecture.tags.map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-claude-bg text-claude-muted border border-claude-border">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {lecture.summary && !expandedId && (
                        <p className="text-xs text-claude-muted mt-2 line-clamp-2">{lecture.summary}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleExpand(lecture._id)}
                        className="text-xs font-medium text-claude-orange border border-claude-border hover:border-claude-orange px-3 py-1.5 rounded-lg transition">
                        {expandedId === lecture._id ? 'Less' : 'More'}
                      </button>
                      <button onClick={() => handleDelete(lecture._id, lecture.title)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {expandedId === lecture._id && (
                  <div className="border-t border-claude-border bg-claude-bg">
                    {/* Tab switcher */}
                    <div className="flex border-b border-claude-border">
                      {['notes', 'raw'].map(t => (
                        <button key={t} onClick={() => setTab(lecture._id, t)}
                          className={`px-5 py-2.5 text-xs font-medium border-b-2 -mb-px transition ${
                            tab === t
                              ? 'border-claude-orange text-claude-orange bg-white'
                              : 'border-transparent text-claude-muted hover:text-claude-dark'
                          }`}>
                          {t === 'notes' ? 'Notes' : 'Raw Transcript'}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 space-y-4">
                      {tab === 'notes' ? (
                        <>
                          {/* Summary */}
                          {lecture.summary && (
                            <div>
                              <p className="text-xs font-semibold text-claude-dark mb-1.5">Summary</p>
                              <p className="text-sm text-claude-dark leading-relaxed">{lecture.summary}</p>
                            </div>
                          )}

                          {/* Topics */}
                          {lecture.topics && lecture.topics.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-claude-dark mb-1.5">Topic Clusters</p>
                              <div className="flex flex-wrap gap-1.5">
                                {lecture.topics.map((t, i) => (
                                  <span key={i} className="text-xs bg-claude-orange-light text-claude-orange border border-orange-200 px-2 py-0.5 rounded-full">{t}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Key Points */}
                          {lecture.keyPoints && lecture.keyPoints.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-claude-dark mb-1.5">Key Points</p>
                              <ul className="space-y-1">
                                {lecture.keyPoints.map((pt, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-sm text-claude-dark">
                                    <span className="text-claude-orange mt-0.5">–</span> {pt}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Entities */}
                          {lecture.entities && lecture.entities.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-claude-dark mb-1.5">Named Entities</p>
                              <div className="flex flex-wrap gap-1.5">
                                {lecture.entities.map((e, i) => (
                                  <span key={i} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{e}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Flashcards */}
                          {lecture.flashcards && lecture.flashcards.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-claude-dark mb-1.5">Flashcards ({lecture.flashcards.length})</p>
                              <div className="space-y-2">
                                {lecture.flashcards.map((fc, i) => (
                                  <div key={i} className="border border-claude-border rounded-lg overflow-hidden text-xs">
                                    <div className="bg-white px-3 py-2 font-medium text-claude-dark border-b border-claude-border">Q: {fc.question}</div>
                                    <div className="px-3 py-2 text-claude-muted">A: {fc.answer}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-claude-dark mb-1.5">Verbatim Speech Transcript</p>
                          <div className="bg-white rounded-lg p-3 max-h-64 overflow-y-auto border border-claude-border">
                            <p className="text-sm text-claude-dark whitespace-pre-wrap leading-relaxed">
                              {lecture.rawTranscript || lecture.transcript || 'No transcript stored.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Export */}
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => {
                          const text = `${lecture.title}\n\nSummary:\n${lecture.summary}\n\nKey Points:\n${(lecture.keyPoints||[]).join('\n')}\n\nRaw Transcript:\n${lecture.rawTranscript || lecture.transcript || ''}`;
                          navigator.clipboard.writeText(text);
                        }} className="text-xs font-medium bg-white border border-claude-border hover:border-claude-orange text-claude-dark hover:text-claude-orange px-3 py-1.5 rounded-lg transition">
                          Copy
                        </button>
                        <button onClick={() => {
                          const text = `${lecture.title}\nDate: ${new Date(lecture.date).toLocaleDateString()}\nSubject: ${lecture.subject||'N/A'}\n\nSummary:\n${lecture.summary}\n\nKey Points:\n${(lecture.keyPoints||[]).join('\n')}\n\nDefinitions:\n${(lecture.definitions||[]).join('\n')}\n\nExam Topics:\n${(lecture.examTopics||[]).join('\n')}\n\nNamed Entities:\n${(lecture.entities||[]).join(', ')}\n\nTopic Clusters:\n${(lecture.topics||[]).join(', ')}\n\nRaw Transcript:\n${lecture.rawTranscript || lecture.transcript || ''}`;
                          const blob = new Blob([text], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url; a.download = `${lecture.title}.txt`; a.click();
                        }} className="text-xs font-medium bg-white border border-claude-border hover:border-claude-orange text-claude-dark hover:text-claude-orange px-3 py-1.5 rounded-lg transition">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LectureHistory;