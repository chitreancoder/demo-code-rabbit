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
        // Reset to first page and latest sort to see the new comment
        setSortOrder('latest');
        setPage(1);
        // Refresh comments
        fetchComments();
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
    <div className="comments-section">
      <h3>Comments ({meta.total})</h3>

      <CommentForm noteId={noteId} onCommentAdded={handleCommentAdded} />

      {error && <div className="error-message">{error}</div>}

      <div className="comments-controls">
        <button onClick={handleSortToggle} className="btn btn-secondary">
          Sort: {sortOrder === 'latest' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {loading ? (
        <div className="loading-message">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="empty-message">No comments yet. Be the first to comment!</div>
      ) : (
        <>
          <div className="comments-list">
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === meta.totalPages}
                className="btn btn-secondary"
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
