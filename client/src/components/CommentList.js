import React, { useState, useEffect, useCallback } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import commentsService from '../services/comments.service';

const CommentList = ({ noteId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await commentsService.getComments(noteId, {
        sort: sortOrder,
        page: page,
        limit: 10
      });

      if (result.success) {
        setComments(result.comments);
        setMeta(result.meta);
      } else {
        setError(result.error || 'Failed to load comments');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [noteId, sortOrder, page]);

  // Fetch comments when noteId, sortOrder, or page changes
  useEffect(() => {
    if (noteId) {
      fetchComments();
    }
  }, [noteId, fetchComments]);

  // Handle adding a new comment
  const handleCommentAdded = async (content) => {
    try {
      const result = await commentsService.addComment(noteId, content);

      if (result.success) {
        // Reset to first page and latest sort, then explicitly refetch
        setSortOrder('latest');
        setPage(1);
        // Explicitly refetch comments to show the new one immediately
        await fetchComments();
      } else {
        setError(result.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };

  // Handle sort toggle
  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest');
    setPage(1); // Reset to first page when sorting changes
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < meta.totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Comments ({meta.total})
        </h3>
        <button
          onClick={handleSortToggle}
          className="px-4 py-2 rounded-lg font-semibold text-sm text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          {sortOrder === 'latest' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      <CommentForm noteId={noteId} onCommentAdded={handleCommentAdded} />

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading comments...
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 px-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-600 dark:text-neutral-400">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === meta.totalPages}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentList;
