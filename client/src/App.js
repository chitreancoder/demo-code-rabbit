import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './logo.svg';
// get notes from api
const getNotes = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/notes');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log(data);
    return data.data || data; // Handle server response format
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
}
const createNote = async () => {
  try {
    console.log('Creating note');
    const response = await fetch('http://localhost:8080/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Test Note', body: 'This is a test note' }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log(data);
    return data.data || data;
  } catch (error) {
    console.error('Error creating note:', error);
    return [];
  }
}
const deleteNote = async (noteId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log(data);
    // After delete, fetch updated list
    return await getNotes();
  } catch (error) {
    console.error('Error deleting note:', error);
    return [];
  }
}
function App() {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    getNotes().then((data) => {
      setNotes(data);
    });
  }, []);
  return (
    <div className="App">
      <button 
        type="button"
        onClick={() => {
          console.log('Clicking me');
          alert('Button clicked!');
        }}
      >Click me</button>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reloadsss.
        </p>
        <p>{notes.map((note) => (
          <div key={note._id}>
            <h2>{note.title}</h2>
            <p>{note.body}</p>
            <button onClick={() => {
              deleteNote(note._id).then((data) => {
                setNotes(data);
              });
            }}>Delete Note</button>
          </div>
        ))}</p>

        <button onClick={() => {
          getNotes().then((data) => {
            setNotes(data);
          });
        }}>Get Notes</button>

        <button onClick={() => {
          console.log('Creating note2');
          createNote().then((data) => {
            console.log('Creating note3', data);
            setNotes((prev) => [...prev, data]);
          });
        }}>Create Note</button> 
     
      </header>
    </div>
  );
}

export default App;
