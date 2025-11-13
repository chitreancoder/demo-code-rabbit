import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import notesRouter from '../notes.routes.js';
import Note from '../../models/notes.model.js';

vi.mock('../../models/notes.model.js');
vi.mock('../../config/mongodb.config.js', () => ({}));

const app = express();
app.use(bodyParser.json());
app.use('/api/notes', notesRouter);

describe('Notes Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/notes', () => {
    it('should fetch all notes successfully', async () => {
      const mockNotes = [
        { _id: '1', title: 'Note 1', body: 'Body 1', author: 'Author 1' },
        { _id: '2', title: 'Note 2', body: 'Body 2', author: 'Author 2' }
      ];

      Note.find = vi.fn((query, callback) => {
        callback(null, mockNotes);
      });

      const response = await request(app)
        .get('/api/notes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNotes);
      expect(response.body.message).toBe('Notes fetched successfully');
      expect(Note.find).toHaveBeenCalledWith({}, expect.any(Function));
    });

    it('should handle error when fetching notes', async () => {
      const mockError = new Error('Database error');

      Note.find = vi.fn((query, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .get('/api/notes')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/notes/:note_id', () => {
    it('should fetch a single note successfully', async () => {
      const mockNote = { _id: '1', title: 'Note 1', body: 'Body 1', author: 'Author 1' };

      Note.findById = vi.fn((id, callback) => {
        callback(null, mockNote);
      });

      const response = await request(app)
        .get('/api/notes/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNote);
      expect(response.body.message).toBe('Note fetched successfully');
      expect(Note.findById).toHaveBeenCalledWith('1', expect.any(Function));
    });

    it('should return 404 when note not found', async () => {
      Note.findById = vi.fn((id, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .get('/api/notes/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Note not found');
    });

    it('should handle error when fetching note', async () => {
      const mockError = new Error('Invalid ID');

      Note.findById = vi.fn((id, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .get('/api/notes/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid ID');
    });
  });

  describe('POST /api/notes', () => {
    it('should create a new note successfully', async () => {
      const newNoteData = {
        title: 'New Note',
        body: 'Note body',
        author: 'Test Author'
      };

      const mockCreatedNote = {
        _id: '123',
        ...newNoteData
      };

      Note.create = vi.fn().mockResolvedValue(mockCreatedNote);

      const response = await request(app)
        .post('/api/notes')
        .send(newNoteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedNote);
      expect(response.body.message).toBe('Note created successfully');
      expect(Note.create).toHaveBeenCalledWith(newNoteData);
    });

    it('should handle error when creating note', async () => {
      const newNoteData = {
        title: 'New Note',
        body: 'Note body',
        author: 'Test Author'
      };

      const mockError = new Error('Validation error');

      Note.create = vi.fn().mockRejectedValue(mockError);

      const response = await request(app)
        .post('/api/notes')
        .send(newNoteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('PATCH /api/notes/:note_id', () => {
    it('should update a note successfully', async () => {
      const updateData = { title: 'Updated Title' };
      const mockUpdatedNote = {
        _id: '1',
        title: 'Updated Title',
        body: 'Body 1',
        author: 'Author 1'
      };

      Note.findByIdAndUpdate = vi.fn((id, update, options, callback) => {
        callback(null, mockUpdatedNote);
      });

      const response = await request(app)
        .patch('/api/notes/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUpdatedNote);
      expect(response.body.message).toBe('Note updated successfully');
      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $set: updateData },
        { new: true },
        expect.any(Function)
      );
    });

    it('should handle error when updating note', async () => {
      const updateData = { title: 'Updated Title' };
      const mockError = new Error('Update failed');

      Note.findByIdAndUpdate = vi.fn((id, update, options, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .patch('/api/notes/1')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Update failed');
    });
  });

  describe('DELETE /api/notes/:note_id', () => {
    it('should delete a note successfully', async () => {
      const mockDeletedNote = {
        _id: '1',
        title: 'Note 1',
        body: 'Body 1',
        author: 'Author 1'
      };

      Note.findByIdAndDelete = vi.fn((id, callback) => {
        callback(null, mockDeletedNote);
      });

      const response = await request(app)
        .delete('/api/notes/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockDeletedNote);
      expect(response.body.message).toBe('Note deleted successfully');
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith('1', expect.any(Function));
    });

    it('should handle error when deleting note', async () => {
      const mockError = new Error('Delete failed');

      Note.findByIdAndDelete = vi.fn((id, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .delete('/api/notes/1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Delete failed');
    });
  });
});

