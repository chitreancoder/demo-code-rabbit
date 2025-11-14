import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import CommentList from './components/CommentList';
import ThemeToggle from './components/ThemeToggle';
import authService from './services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Plus, RefreshCw, LogOut, X, Loader2, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/notes';

// Helper function to format timestamps
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

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
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            <Button
              onClick={() => setShowCreateModal(true)}
              disabled={loading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
            <Button
              onClick={loadNotes}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                    {note.createdAt && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(note.createdAt)}</span>
                        {note.updatedAt && note.updatedAt !== note.createdAt && (
                          <span className="ml-1">(edited)</span>
                        )}
                      </div>
                    )}
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
                    <Button
                      onClick={() => setViewingNote(note)}
                      disabled={loading}
                      variant="secondary"
                      size="sm"
                      className="flex-1 min-w-[80px]"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => openEditModal(note)}
                      disabled={loading}
                      variant="secondary"
                      size="sm"
                      className="flex-1 min-w-[80px]"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(note._id)}
                      disabled={loading}
                      variant="destructive"
                      size="sm"
                      className="flex-1 min-w-[80px]"
                    >
                      Delete
                    </Button>
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
              <Button onClick={closeModals} variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter note title"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  required
                  placeholder="Enter note content"
                  rows="6"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-vertical"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button type="button" onClick={closeModals} variant="secondary" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Note'}
                </Button>
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
              <Button onClick={closeModals} variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter note title"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  required
                  placeholder="Enter note content"
                  rows="6"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-vertical"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button type="button" onClick={closeModals} variant="secondary" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : 'Update Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={closeModals}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex-1 pr-4">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 break-words">
                  {viewingNote.title}
                </h2>
                {viewingNote.createdAt && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Created {formatDate(viewingNote.createdAt)}</span>
                    {viewingNote.updatedAt && viewingNote.updatedAt !== viewingNote.createdAt && (
                      <span>• Updated {formatDate(viewingNote.updatedAt)}</span>
                    )}
                  </div>
                )}
              </div>
              <Button onClick={closeModals} variant="ghost" size="icon" className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
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
