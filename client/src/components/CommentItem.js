import React from 'react';

const CommentItem = ({ comment }) => {
  // Format timestamp to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border-l-4 border-todoist-500 hover:shadow-sm transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
        <span className="font-semibold text-todoist-500">
          {comment.author}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          {formatDate(comment.createdAt)}
        </span>
      </div>
      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
        {comment.content}
      </p>
    </div>
  );
};

export default CommentItem;
