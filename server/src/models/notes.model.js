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
   }
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
