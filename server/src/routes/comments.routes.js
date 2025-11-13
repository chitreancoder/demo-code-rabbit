import express from 'express';
import sanitizeHtml from 'sanitize-html';
import Comment from '../models/comment.model.js';
import Note from '../models/notes.model.js';
import authenticateToken from '../middleware/auth.middleware.js';

const commentsRouter = express.Router();

/* Add comment to a note */
commentsRouter.post("/notes/:noteId/comments", authenticateToken, async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).send({
        success: false,
        error: "Comment content is required"
      });
    }

    // Verify note exists and user has access to it
    const note = await Note.findOne({ _id: noteId, userId: req.user._id });
    if (!note) {
      return res.status(404).send({
        success: false,
        error: "Note not found or you don't have permission to comment on it"
      });
    }

    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {}
    });

    // Create comment
    const newComment = await Comment.create({
      content: sanitizedContent,
      noteId: noteId,
      userId: req.user._id,
      author: req.user.username
    });

    res.status(201).send({
      success: true,
      data: newComment,
      message: "Comment added successfully"
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      error: err.message
    });
  }
});

/* Get comments for a note with pagination and sorting */
commentsRouter.get("/notes/:noteId/comments", authenticateToken, async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { sort = 'latest', page = 1, limit = 10 } = req.query;

    // Verify note exists and user has access to it
    const note = await Note.findOne({ _id: noteId, userId: req.user._id });
    if (!note) {
      return res.status(404).send({
        success: false,
        error: "Note not found or you don't have permission to view its comments"
      });
    }

    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    const sortOrder = sort === 'oldest' ? 1 : -1;

    // Fetch comments with pagination
    const comments = await Comment.find({ noteId: noteId })
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'username email');

    // Get total count for pagination metadata
    const total = await Comment.countDocuments({ noteId: noteId });

    res.status(200).send({
      success: true,
      data: comments,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: total,
        totalPages: Math.ceil(total / limitNum)
      },
      message: "Comments fetched successfully"
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      error: err.message
    });
  }
});

export default commentsRouter;
