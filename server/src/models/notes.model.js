// Post.model.js
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
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
