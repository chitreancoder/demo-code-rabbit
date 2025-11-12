import express from 'express';
import Note from '../models/notes.model';
const notesRouter = express.Router();
//const Post = require('../models/post.model');

/* Get all Notes */
notesRouter.get("/", (req, res, next) => {
  Note.find().then((notes) => {
    res.status(200).send({
      success: true,
      data: notes,
      message: "Notes fetched successfully"
    });
  }).catch((err) => {
    res.status(400).send({
      success: false,
      error: err.message
    });
  });
});

/* Get Single Note */
notesRouter.get("/:note_id", (req, res, next) => {
  Note.findById(req.params.note_id, function (err, result) {
    if(err){
      res.status(400).send({
        success: false,
        error: err.message
      });
    } else if (!result) {
      res.status(404).send({
        success: false,
        error: "Note not found"
      });
    } else {
      res.status(200).send({
        success: true,
        data: result,
        message: "Note fetched successfully"
      });
    }
  });
});

/* Add Single Note */
notesRouter.post("/", (req, res, next) => {
  let newNote = {
    title: req.body.title,
    body: req.body.body,
    author: req.body.author
  };
  Note.create(newNote).then((note) => {
    res.status(201).send({
      success: true,
      data: note,
      message: "Note created successfully"
    });
  }).catch((err) => {
    res.status(400).send({
      success: false,
      error: err.message
    });
  });
});

/* Edit Single Note */
notesRouter.patch("/:note_id", (req, res, next) => {
  let fieldsToUpdate = req.body;
  Note.findByIdAndUpdate(req.params.note_id,{ $set: fieldsToUpdate }, { new: true },  function (err, result) {
    if(err){
      res.status(400).send({
        success: false,
        error: err.message
      });
    } else {
      res.status(200).send({
        success: true,
        data: result,
        message: "Note updated successfully"
      });
    }
  });
});

/* Delete Single Note */
notesRouter.delete("/:note_id", (req, res, next) => {
  Note.findByIdAndDelete(req.params.note_id, function(err, result){
    if(err){
      res.status(400).send({
        success: false,
        error: err.message
      });
    } else {
      res.status(200).send({
        success: true,
        data: result,
        message: "Note deleted successfully"
      });
    }
  });
});

export default notesRouter;