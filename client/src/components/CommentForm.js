import React, { useState } from 'react';

const CommentForm = ({ noteId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onCommentAdded(content);
      setContent('');
    } catch (err) {
      console.error('Comment submission error:', err);
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-form-container">
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="comment-form">
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError('');
            }}
            placeholder="Write a comment..."
            rows="3"
            disabled={loading}
            className="comment-textarea"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !content.trim()}
        >
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;
