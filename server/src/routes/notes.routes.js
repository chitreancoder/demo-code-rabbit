import express from 'express';
import Note from '../models/notes.model.js';
import authenticateToken from '../middleware/auth.middleware.js';
const notesRouter = express.Router();
//const Post = require('../models/post.model');

/* Get all Notes */
notesRouter.get("/", authenticateToken, async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user._id });
    res.status(200).send({
      success: true,
      data: notes,
      message: "Notes fetched successfully"
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      error: err.message
    });
  }
});
/* Get Single Note */
notesRouter.get("/:note_id", authenticateToken, async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.note_id, userId: req.user._id });
    if (!note) {
      return res.status(404).send({
        success: false,
        error: "Note not found"
      });
    }
    res.status(200).send({
      success: true,
      data: note,
      message: "Note fetched successfully"
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      error: err.message
    });
  }
});

/* Add Single Note */
notesRouter.post("/", authenticateToken, async (req, res, next) => {
  try {
    let newNote = {
      title: req.body.title || "",
      body: req.body.body,
      author: req.user.username,
      userId: req.user._id
    };
    const note = await Note.create(newNote);
    res.status(201).send({
      success: true,
      data: note,
      message: "Note created successfully"
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      error: err.message
    });
  }
});

/* Edit Single Note */
notesRouter.patch("/:note_id", authenticateToken, async (req, res, next) => {
  try {
    // First verify ownership
    const existingNote = await Note.findOne({ _id: req.params.note_id, userId: req.user._id });
    if (!existingNote) {
      return res.status(404).send({
        success: false,
        error: "Note not found or you don't have permission to edit it"
      });
    }
    
    let fieldsToUpdate = req.body;
    // Prevent updating userId or author through PATCH
    delete fieldsToUpdate.userId;
    delete fieldsToUpdate.author;
    
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.note_id,
      { $set: fieldsToUpdate },
      { new: true }
    );
    
    res.status(200).send({
      success: true,
      data: updatedNote,
      message: "Note updated successfully"
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      error: err.message
    });
  }
});

/* Delete Single Note */
notesRouter.delete("/:note_id", authenticateToken, async (req, res, next) => {
  try {
    // First verify ownership
    const note = await Note.findOne({ _id: req.params.note_id, userId: req.user._id });
    if (!note) {
      return res.status(404).send({
        success: false,
        error: "Note not found or you don't have permission to delete it"
      });
    }
    
    await Note.findByIdAndDelete(req.params.note_id);
    res.status(200).send({
      success: true,
      data: note,
      message: "Note deleted successfully"
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      error: err.message
    });
  }
});

export default notesRouter;