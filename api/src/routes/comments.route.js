const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  createComment,
  getCommentById,
  getCommentsByPostId,
  deleteComment,
} = require('../db/queries/commentQueries');
const {
  likeComment,
  unlikeComment,
  hasUserLikedComment,
  getCommentLikeCount,
} = require('../db/queries/likeQueries');

const router = express.Router();

/**
 * @route POST /api/comments
 * @desc Create a new comment on a post
 * @access Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { postId, content } = req.body;

    if (!postId || !content || content.trim() === '') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Post ID and content are required',
      });
    }

    const commentData = {
      postId: parseInt(postId),
      userId: req.user.id,
      content: content.trim(),
    };

    const newComment = await createComment(commentData);

    res.status(201).json({
      message: 'Comment created successfully',
      comment: newComment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      error: 'Failed to create comment',
      message: 'An error occurred while creating the comment',
    });
  }
});

/**
 * @route GET /api/comments/:id
 * @desc Get a specific comment
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    if (isNaN(commentId)) {
      return res.status(400).json({
        error: 'Invalid comment ID',
        message: 'Comment ID must be a valid number',
      });
    }

    const comment = await getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        message: 'The requested comment does not exist',
      });
    }

    // Add like statistics
    const likeCount = await getCommentLikeCount(commentId);
    const hasLiked = await hasUserLikedComment(commentId, req.user.id);

    const commentWithStats = {
      ...comment,
      likeCount,
      hasLiked,
    };

    res.status(200).json({
      message: 'Comment retrieved successfully',
      comment: commentWithStats,
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({
      error: 'Failed to fetch comment',
      message: 'An error occurred while fetching the comment',
    });
  }
});

/**
 * @route GET /api/comments/post/:postId
 * @desc Get all comments for a specific post
 * @access Private
 */
router.get('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    if (isNaN(postId)) {
      return res.status(400).json({
        error: 'Invalid post ID',
        message: 'Post ID must be a valid number',
      });
    }

    const comments = await getCommentsByPostId(postId, limit, offset);

    // Add like counts and user like status to each comment
    const commentsWithStats = await Promise.all(
      comments.map(async (comment) => {
        const likeCount = await getCommentLikeCount(comment.id);
        const hasLiked = await hasUserLikedComment(comment.id, req.user.id);

        return {
          ...comment,
          likeCount,
          hasLiked,
        };
      })
    );

    res.status(200).json({
      message: 'Comments retrieved successfully',
      comments: commentsWithStats,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching post comments:', error);
    res.status(500).json({
      error: 'Failed to fetch comments',
      message: 'An error occurred while fetching post comments',
    });
  }
});

/**
 * @route DELETE /api/comments/:id
 * @desc Delete a comment
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    if (isNaN(commentId)) {
      return res.status(400).json({
        error: 'Invalid comment ID',
        message: 'Comment ID must be a valid number',
      });
    }

    const deletedComment = await deleteComment(commentId, req.user.id);

    if (!deletedComment) {
      return res.status(404).json({
        error: 'Comment not found or unauthorized',
        message: 'Comment not found or you are not authorized to delete it',
      });
    }

    res.status(200).json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      error: 'Failed to delete comment',
      message: 'An error occurred while deleting the comment',
    });
  }
});

/**
 * @route POST /api/comments/:id/like
 * @desc Like/unlike a comment
 * @access Private
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    if (isNaN(commentId)) {
      return res.status(400).json({
        error: 'Invalid comment ID',
        message: 'Comment ID must be a valid number',
      });
    }

    const hasLiked = await hasUserLikedComment(commentId, req.user.id);

    if (hasLiked) {
      // Unlike the comment
      await unlikeComment(commentId, req.user.id);
      const likeCount = await getCommentLikeCount(commentId);

      res.status(200).json({
        message: 'Comment unliked successfully',
        liked: false,
        likeCount,
      });
    } else {
      // Like the comment
      await likeComment(commentId, req.user.id);
      const likeCount = await getCommentLikeCount(commentId);

      res.status(200).json({
        message: 'Comment liked successfully',
        liked: true,
        likeCount,
      });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({
      error: 'Failed to toggle comment like',
      message: 'An error occurred while toggling the comment like',
    });
  }
});

module.exports = router;
