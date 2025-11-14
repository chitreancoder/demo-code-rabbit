// notes.model.js
import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
   title: {
       type: String,
       required: true
   },
   body: {
       type: String
   },
   author: {
       type: String
   },
   userId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
   }
}, {
   timestamps: true
});

// Cascade delete comments when a note is deleted
noteSchema.pre('findOneAndDelete', async function(next) {
   try {
      const noteId = this.getQuery()['_id'];
      // Import Comment model dynamically to avoid circular dependency
      const Comment = mongoose.model('Comment');
      await Comment.deleteMany({ noteId: noteId });
      next();
   } catch (error) {
      next(error);
   }
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
