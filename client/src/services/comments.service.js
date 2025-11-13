import authService from './auth.service';

const API_BASE = 'http://localhost:8080/api';

export const commentsService = {
  // Add a comment to a note
  addComment: async (noteId, content) => {
    try {
      const response = await fetch(`${API_BASE}/notes/${noteId}/comments`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        try {
          const data = await response.json();
          return { success: false, error: data.error || `HTTP ${response.status}` };
        } catch {
          const text = await response.text();
          return { success: false, error: text || `HTTP ${response.status}` };
        }
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, comment: data.data };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error('Add comment error:', error);
      return { success: false, error: 'Unable to add comment' };
    }
  },

  // Get comments for a note with pagination and sorting
  getComments: async (noteId, options = {}) => {
    try {
      const { sort = 'latest', page = 1, limit = 10 } = options;
      const queryParams = new URLSearchParams({
        sort,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(
        `${API_BASE}/notes/${noteId}/comments?${queryParams}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders()
        }
      );

      if (!response.ok) {
        try {
          const data = await response.json();
          return { success: false, error: data.error || `HTTP ${response.status}` };
        } catch {
          const text = await response.text();
          return { success: false, error: text || `HTTP ${response.status}` };
        }
      }

      const data = await response.json();
      if (data.success) {
        return {
          success: true,
          comments: data.data,
          meta: data.meta
        };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error('Get comments error:', error);
      return { success: false, error: 'Unable to fetch comments' };
    }
  }
};

export default commentsService;
