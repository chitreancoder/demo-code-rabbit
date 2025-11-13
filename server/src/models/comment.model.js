// Comment.model.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
commentSchema.index({ noteId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
