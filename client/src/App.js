import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import authService from './services/auth.service';

const API_BASE = 'http://localhost:8080/api/notes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [notes, setNotes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);

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
    setFormData({ title: '', body: '' });
  };

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return showRegister ? (
      <Register 
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Authenticated - show notes app
  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <div className="app-header-bar">
            <h1 className="app-title">Notes App</h1>
            <div className="user-info">
              <span className="welcome-text">Welcome, {user?.username}!</span>
              <button 
                className="btn btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="actions-bar">
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
              disabled={loading}
            >
              + Create Note
            </button>
            <button 
              className="btn btn-secondary"
              onClick={loadNotes}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          {loading && <div className="loading">Loading...</div>}

          <div className="notes-grid">
            {notes.length === 0 && !loading ? (
              <div className="empty-state">
                <p>No notes yet. Create your first note!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note._id} className="note-card">
                  <div className="note-card-header">
                    <h3 className="note-title">{note.title}</h3>
                  </div>
                  <div className="note-card-body">
                    <p className="note-body">{note.body}</p>
                    {note.author && (
                      <p className="note-author">By: {note.author}</p>
                    )}
                  </div>
                  <div className="note-card-actions">
                    <button 
                      className="btn btn-edit"
                      onClick={() => openEditModal(note)}
                      disabled={loading}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={() => handleDelete(note._id)}
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showCreateModal && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Note</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <form onSubmit={handleCreate} className="note-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Enter note title"
                  />
                </div>
                <div className="form-group">
                  <label>Body</label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    required
                    placeholder="Enter note content"
                    rows="5"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    Create Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingNote && (
          <div className="modal-overlay" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Note</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <form onSubmit={handleUpdate} className="note-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Enter note title"
                  />
                </div>
                <div className="form-group">
                  <label>Body</label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    required
                    placeholder="Enter note content"
                    rows="5"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    Update Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
