import React, { useState, useEffect } from 'react';
import { 
  BookText, 
  Plus, 
  Trash2, 
  Pin, 
  Search, 
  Check, 
  CloudCheck, 
  Folder, 
  Tag, 
  Eye, 
  Edit3, 
  Sparkles,
  Copy,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Note } from '../types';

export const NoteTaker: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, syncStatus } = useApp();

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Active note editor state
  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];
  const [editorTitle, setEditorTitle] = useState(activeNote?.title || '');
  const [editorContent, setEditorContent] = useState(activeNote?.content || '');
  const [editorSubject, setEditorSubject] = useState(activeNote?.subject || 'Computer Science');
  const [editorTags, setEditorTags] = useState<string[]>(activeNote?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Keep editor state in sync when note selection changes
  useEffect(() => {
    if (activeNote) {
      setEditorTitle(activeNote.title);
      setEditorContent(activeNote.content);
      setEditorSubject(activeNote.subject);
      setEditorTags(activeNote.tags || []);
    }
  }, [activeNote?.id]);

  // Debounced auto-save to cloud
  useEffect(() => {
    if (!activeNote) return;
    const timer = setTimeout(() => {
      if (
        editorTitle !== activeNote.title ||
        editorContent !== activeNote.content ||
        editorSubject !== activeNote.subject
      ) {
        updateNote(activeNote.id, {
          title: editorTitle,
          content: editorContent,
          subject: editorSubject,
          tags: editorTags,
        });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [editorTitle, editorContent, editorSubject, editorTags]);

  const handleCreateNewNote = async () => {
    const newId = await addNote({
      title: 'Untitled Study Note',
      content: '# New Lecture Notes\n\n- Key Concept:\n- Important definitions:\n- Exam highlights:\n',
      subject: selectedSubject === 'all' ? 'General Study' : selectedSubject,
      tags: ['revision'],
      isPinned: false,
    });
    setSelectedNoteId(newId);
    setPreviewMode(false);
  };

  const handleTogglePin = (note: Note) => {
    updateNote(note.id, { isPinned: !note.isPinned });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!editorTags.includes(tagInput.trim())) {
        const next = [...editorTags, tagInput.trim()];
        setEditorTags(next);
        if (activeNote) updateNote(activeNote.id, { tags: next });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const next = editorTags.filter(t => t !== tag);
    setEditorTags(next);
    if (activeNote) updateNote(activeNote.id, { tags: next });
  };

  const copyNoteContent = () => {
    navigator.clipboard.writeText(editorContent);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const subjects = Array.from(new Set(notes.map(n => n.subject)));

  // Filter notes
  const filteredNotes = notes.filter(n => {
    if (selectedSubject !== 'all' && n.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q) ||
        n.tags?.some(t => t.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => {
    // Pinned notes first, then latest updated
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookText className="w-8 h-8 text-emerald-500" />
            <span>Integrated Cloud Notebook</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time synchronized study notes, lecture summaries, and markdown revisions.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Container: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        
        {/* Left Notes List Sidebar (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedSubject === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({notes.length})
            </button>
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                  selectedSubject === s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px]">
            {filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer border transition-all text-left space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/80 shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {note.subject}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(note);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        note.isPinned
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className={`font-bold text-xs truncate ${
                    isSelected ? 'text-emerald-900 dark:text-emerald-300 font-extrabold' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {note.title || 'Untitled Note'}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {note.content.replace(/[#*`_]/g, '')}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    {note.tags && note.tags.length > 0 && (
                      <span className="truncate max-w-[120px]">
                        #{note.tags.join(' #')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Active Editor Area (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col space-y-4">
          
          {activeNote ? (
            <>
              {/* Note Metadata Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="Note Title..."
                    className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white bg-transparent border-0 focus:outline-hidden w-full"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* Mode switch */}
                  <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                    <button
                      onClick={() => setPreviewMode(false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        !previewMode
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setPreviewMode(true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        previewMode
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>

                  <button
                    onClick={copyNoteContent}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Copy Markdown"
                  >
                    {copiedNotification ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Course tag & Save Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span>Course:</span>
                  <input
                    type="text"
                    value={editorSubject}
                    onChange={(e) => setEditorSubject(e.target.value)}
                    className="font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-0.5 border-0 focus:outline-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CloudCheck className="w-4 h-4" />
                  <span>Auto-saved to cloud</span>
                </div>
              </div>

              {/* Tags Editor */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {editorTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                  >
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-rose-500">×</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ add tag (Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="text-xs bg-transparent border-0 focus:outline-hidden text-slate-600 dark:text-slate-300 placeholder:text-slate-400 w-28"
                />
              </div>

              {/* Editor / Preview Area */}
              <div className="flex-1 min-h-[350px] pt-2">
                {previewMode ? (
                  <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans p-2">
                    {editorContent}
                  </div>
                ) : (
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Write your study notes, formulas, lecture summaries in Markdown..."
                    className="w-full h-full min-h-[350px] p-2 bg-transparent text-sm text-slate-900 dark:text-white border-0 focus:outline-hidden font-mono resize-none leading-relaxed"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <BookText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No note selected</p>
              <button
                onClick={handleCreateNewNote}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                Create First Note
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
