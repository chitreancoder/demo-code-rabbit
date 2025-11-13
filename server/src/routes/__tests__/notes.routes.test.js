import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import notesRouter from '../notes.routes.js';
import Note from '../../models/notes.model.js';

// Mock user for authentication
const mockUser = {
  _id: 'user123',
  username: 'testuser',
  email: 'test@example.com'
};

// Mock auth middleware to inject test user
vi.mock('../../middleware/auth.middleware.js', () => ({
  default: (req, res, next) => {
    req.user = mockUser;
    next();
  }
}));
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
        { _id: '1', title: 'Note 1', body: 'Body 1', author: 'testuser', userId: 'user123' },
        { _id: '2', title: 'Note 2', body: 'Body 2', author: 'testuser', userId: 'user123' }
      ];

      Note.find = vi.fn().mockResolvedValue(mockNotes);

      const response = await request(app)
        .get('/api/notes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNotes);
      expect(response.body.message).toBe('Notes fetched successfully');
      expect(Note.find).toHaveBeenCalledWith({ userId: mockUser._id });
    });

    it('should handle error when fetching notes', async () => {
      const mockError = new Error('Database error');

      Note.find = vi.fn().mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/notes')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/notes/:note_id', () => {
    it('should fetch a single note successfully', async () => {
      const mockNote = { _id: '1', title: 'Note 1', body: 'Body 1', author: 'testuser', userId: 'user123' };

      Note.findOne = vi.fn().mockResolvedValue(mockNote);

      const response = await request(app)
        .get('/api/notes/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNote);
      expect(response.body.message).toBe('Note fetched successfully');
      expect(Note.findOne).toHaveBeenCalledWith({ _id: '1', userId: mockUser._id });
    });

    it('should return 404 when note not found', async () => {
      Note.findOne = vi.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/notes/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Note not found');
    });

    it('should handle error when fetching note', async () => {
      const mockError = new Error('Invalid ID');

      Note.findOne = vi.fn().mockRejectedValue(mockError);

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
        body: 'Note body'
      };

      const expectedNoteData = {
        title: 'New Note',
        body: 'Note body',
        author: mockUser.username,
        userId: mockUser._id
      };

      const mockCreatedNote = {
        _id: '123',
        ...expectedNoteData
      };

      Note.create = vi.fn().mockResolvedValue(mockCreatedNote);

      const response = await request(app)
        .post('/api/notes')
        .send(newNoteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedNote);
      expect(response.body.message).toBe('Note created successfully');
      expect(Note.create).toHaveBeenCalledWith(expectedNoteData);
    });

    it('should handle error when creating note', async () => {
      const newNoteData = {
        title: 'New Note',
        body: 'Note body'
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
      const existingNote = {
        _id: '1',
        title: 'Old Title',
        body: 'Body 1',
        author: 'testuser',
        userId: 'user123'
      };
      const mockUpdatedNote = {
        _id: '1',
        title: 'Updated Title',
        body: 'Body 1',
        author: 'testuser',
        userId: 'user123'
      };

      Note.findOne = vi.fn().mockResolvedValue(existingNote);
      Note.findByIdAndUpdate = vi.fn().mockResolvedValue(mockUpdatedNote);

      const response = await request(app)
        .patch('/api/notes/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUpdatedNote);
      expect(response.body.message).toBe('Note updated successfully');
      expect(Note.findOne).toHaveBeenCalledWith({ _id: '1', userId: mockUser._id });
      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $set: updateData },
        { new: true }
      );
    });

    it('should return 404 when note not found or not owned by user', async () => {
      const updateData = { title: 'Updated Title' };

      Note.findOne = vi.fn().mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/notes/999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Note not found or you don't have permission to edit it");
    });

    it('should handle error when updating note', async () => {
      const updateData = { title: 'Updated Title' };
      const existingNote = {
        _id: '1',
        title: 'Old Title',
        body: 'Body 1',
        author: 'testuser',
        userId: 'user123'
      };
      const mockError = new Error('Update failed');

      Note.findOne = vi.fn().mockResolvedValue(existingNote);
      Note.findByIdAndUpdate = vi.fn().mockRejectedValue(mockError);

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
      const mockNote = {
        _id: '1',
        title: 'Note 1',
        body: 'Body 1',
        author: 'testuser',
        userId: 'user123'
      };

      Note.findOne = vi.fn().mockResolvedValue(mockNote);
      Note.findByIdAndDelete = vi.fn().mockResolvedValue(mockNote);

      const response = await request(app)
        .delete('/api/notes/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNote);
      expect(response.body.message).toBe('Note deleted successfully');
      expect(Note.findOne).toHaveBeenCalledWith({ _id: '1', userId: mockUser._id });
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should return 404 when note not found or not owned by user', async () => {
      Note.findOne = vi.fn().mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/notes/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Note not found or you don't have permission to delete it");
    });

    it('should handle error when deleting note', async () => {
      const mockNote = {
        _id: '1',
        title: 'Note 1',
        body: 'Body 1',
        author: 'testuser',
        userId: 'user123'
      };
      const mockError = new Error('Delete failed');

      Note.findOne = vi.fn().mockResolvedValue(mockNote);
      Note.findByIdAndDelete = vi.fn().mockRejectedValue(mockError);

      const response = await request(app)
        .delete('/api/notes/1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Delete failed');
    });
  });
});

