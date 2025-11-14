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
    <div className="mb-6">
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError('');
          }}
          placeholder="Write a comment..."
          rows="3"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-todoist-500 focus:ring-2 focus:ring-todoist-500/20 transition-all duration-200 resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-6 py-2.5 rounded-lg font-semibold text-white bg-todoist-500 hover:bg-todoist-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Comment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
