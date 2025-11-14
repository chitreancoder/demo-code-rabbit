import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import CommentList from './components/CommentList';
import ThemeToggle from './components/ThemeToggle';
import authService from './services/auth.service';

const API_BASE = 'http://localhost:8080/api/notes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [notes, setNotes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [formData, setFormData] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    // Tailwind needs 'dark' class for dark mode
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    // Toggle dark class for Tailwind
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const token = authService.getToken();
    const storedUser = authService.getUser();

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }
  }, []);

  // Load notes when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadNotes();
    }
  }, [isAuthenticated]);

  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleRegister = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setNotes([]);
  };

  const getNotes = async () => {
    try {
      const response = await fetch(API_BASE, {
        headers: authService.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  };

  const createNote = async (noteData) => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  };

  const updateNote = async (noteId, noteData) => {
    try {
      const response = await fetch(`${API_BASE}/${noteId}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await fetch(`${API_BASE}/${noteId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await getNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  const loadNotes = async () => {
    setLoading(true);
    const data = await getNotes();
    setNotes(data);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newNote = await createNote(formData);
      setNotes([...notes, newNote]);
      setShowCreateModal(false);
      setFormData({ title: '', body: '' });
    } catch (error) {
      alert('Failed to create note');
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedNote = await updateNote(editingNote._id, formData);
      setNotes(notes.map(note => note._id === editingNote._id ? updatedNote : note));
      setEditingNote(null);
      setFormData({ title: '', body: '' });
    } catch (error) {
      alert('Failed to update note');
    }
    setLoading(false);
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    setLoading(true);
    try {
      const updatedNotes = await deleteNote(noteId);
      setNotes(updatedNotes);
    } catch (error) {
      alert('Failed to delete note');
    }
    setLoading(false);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      body: note.body || ''
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingNote(null);
    setViewingNote(null);
    setFormData({ title: '', body: '' });
  };

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // Authenticated - show notes app
  return (
    <div className="App min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Bar */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100">
                Notes
              </h1>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                  Welcome, <span className="text-todoist-500 font-semibold">{user?.username}</span>
                </span>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-todoist-500 hover:bg-todoist-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Note
            </button>
            <button
              onClick={loadNotes}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm border border-neutral-200 dark:border-neutral-600 flex items-center gap-2"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 text-neutral-700 dark:text-neutral-300 text-lg font-medium">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            </div>
          )}

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.length === 0 && !loading ? (
              <div className="col-span-full bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <svg className="w-20 h-20 text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xl text-neutral-600 dark:text-neutral-400">
                    No notes yet. Create your first note to get started!
                  </p>
                </div>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note._id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 break-words">
                      {note.title}
                    </h3>
                  </div>
                  <div className="mb-4 flex-1">
                    <p className="text-neutral-700 dark:text-neutral-300 line-clamp-4 whitespace-pre-wrap break-words">
                      {note.body}
                    </p>
                    {note.author && (
                      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 italic">
                        By: {note.author}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex-wrap">
                    <button
                      onClick={() => setViewingNote(note)}
                      disabled={loading}
                      className="flex-1 min-w-[80px] px-3 py-2 rounded-lg font-semibold text-sm text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 transition-colors duration-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(note)}
                      disabled={loading}
                      className="flex-1 min-w-[80px] px-3 py-2 rounded-lg font-semibold text-sm text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      disabled={loading}
                      className="flex-1 min-w-[80px] px-3 py-2 rounded-lg font-semibold text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeModals}>
          <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Create New Note
              </h2>
              <button onClick={closeModals} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter note title"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-todoist-500 focus:ring-2 focus:ring-todoist-500/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Content
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  required
                  placeholder="Enter note content"
                  rows="6"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-todoist-500 focus:ring-2 focus:ring-todoist-500/20 transition-all duration-200 resize-vertical"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button type="button" onClick={closeModals} className="flex-1 px-6 py-3 rounded-lg font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors duration-200">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-todoist-500 hover:bg-todoist-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm">
                  {loading ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeModals}>
          <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Edit Note
              </h2>
              <button onClick={closeModals} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter note title"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-todoist-500 focus:ring-2 focus:ring-todoist-500/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Content
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  required
                  placeholder="Enter note content"
                  rows="6"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-todoist-500 focus:ring-2 focus:ring-todoist-500/20 transition-all duration-200 resize-vertical"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button type="button" onClick={closeModals} className="flex-1 px-6 py-3 rounded-lg font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors duration-200">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-todoist-500 hover:bg-todoist-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm">
                  {loading ? 'Updating...' : 'Update Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeModals}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 break-words pr-4">
                {viewingNote.title}
              </h2>
              <button onClick={closeModals} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex-shrink-0">
                <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-800 dark:text-neutral-200 text-lg leading-relaxed whitespace-pre-wrap break-words">
                  {viewingNote.body}
                </p>
                {viewingNote.author && (
                  <p className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400 italic">
                    By: {viewingNote.author}
                  </p>
                )}
              </div>
              <CommentList noteId={viewingNote._id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
