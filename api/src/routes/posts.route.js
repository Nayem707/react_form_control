const express = require('express');
const { upload, handleMulterError } = require('../utils/fileUpload');
const {
  cloudinaryUploadMiddleware,
} = require('../middleware/cloudinaryUpload');
const { authenticateToken } = require('../middleware/auth');
const {
  createPost,
  getPostById,
  getAllPosts,
  getPostsByUserId,
  updatePost,
  deletePost,
} = require('../db/queries/postQueries');
const {
  likePost,
  unlikePost,
  hasUserLikedPost,
  getPostLikeCount,
} = require('../db/queries/likeQueries');
const { getCommentsByPostId } = require('../db/queries/commentQueries');

const router = express.Router();

/**
 * @route POST /api/posts
 * @desc Create a new post with images (uploads to Cloudinary)
 * @access Private
 */
router.post(
  '/',
  authenticateToken,
  upload.array('images', 4),
  cloudinaryUploadMiddleware({ folder: 'social-media/posts' }),
  handleMulterError,
  async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({
          error: 'Content is required',
          message: 'Post content cannot be empty',
        });
      }

      // Handle uploaded images - now using Cloudinary URLs
      let images = null;
      if (req.files && req.files.length > 0) {
        const imageUrls = req.files.map((file) => file.cloudinaryUrl);
        images = JSON.stringify(imageUrls);
      }

      const postData = {
        userId: req.user.id,
        content: content.trim(),
        images,
      };

      const newPost = await createPost(postData);

      res.status(201).json({
        message: 'Post created successfully',
        post: newPost,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({
        error: 'Failed to create post',
        message: 'An error occurred while creating the post',
      });
    }
  }
);

/**
 * @route GET /api/posts
 * @desc Get all posts (feed)
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getAllPosts(limit, offset);

    // Add like counts and user like status to each post
    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await getPostLikeCount(post.id);
        const hasLiked = await hasUserLikedPost(post.id, req.user.id);

        return {
          ...post,
          likeCount,
          hasLiked,
          images: post.images ? JSON.parse(post.images) : null,
        };
      })
    );

    res.status(200).json({
      message: 'Posts retrieved successfully',
      posts: postsWithStats,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      error: 'Failed to fetch posts',
      message: 'An error occurred while fetching posts',
    });
  }
});

/**
 * @route GET /api/posts/:id
 * @desc Get a specific post with comments
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        error: 'Invalid post ID',
        message: 'Post ID must be a valid number',
      });
    }

    const post = await getPostById(postId);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'The requested post does not exist',
      });
    }

    // Add post statistics
    const likeCount = await getPostLikeCount(postId);
    const hasLiked = await hasUserLikedPost(postId, req.user.id);
    const comments = await getCommentsByPostId(postId, 50, 0);

    const postWithStats = {
      ...post,
      likeCount,
      hasLiked,
      images: post.images ? JSON.parse(post.images) : null,
      comments,
    };

    res.status(200).json({
      message: 'Post retrieved successfully',
      post: postWithStats,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      error: 'Failed to fetch post',
      message: 'An error occurred while fetching the post',
    });
  }
});

/**
 * @route GET /api/posts/user/:userId
 * @desc Get posts by a specific user
 * @access Private
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number',
      });
    }

    const posts = await getPostsByUserId(userId, limit, offset);

    // Add like counts and user like status
    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await getPostLikeCount(post.id);
        const hasLiked = await hasUserLikedPost(post.id, req.user.id);

        return {
          ...post,
          likeCount,
          hasLiked,
          images: post.images ? JSON.parse(post.images) : null,
        };
      })
    );

    res.status(200).json({
      message: 'User posts retrieved successfully',
      posts: postsWithStats,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      error: 'Failed to fetch user posts',
      message: 'An error occurred while fetching user posts',
    });
  }
});

/**
 * @route PUT /api/posts/:id
 * @desc Update a post
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;

    if (isNaN(postId)) {
      return res.status(400).json({
        error: 'Invalid post ID',
        message: 'Post ID must be a valid number',
      });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({
        error: 'Content is required',
        message: 'Post content cannot be empty',
      });
    }

    const updatedPost = await updatePost(postId, req.user.id, {
      content: content.trim(),
    });

    if (!updatedPost) {
      return res.status(404).json({
        error: 'Post not found or unauthorized',
        message: 'Post not found or you are not authorized to update it',
      });
    }

    res.status(200).json({
      message: 'Post updated successfully',
      post: {
        ...updatedPost,
        images: updatedPost.images ? JSON.parse(updatedPost.images) : null,
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      error: 'Failed to update post',
      message: 'An error occurred while updating the post',
    });
  }
});

/**
 * @route DELETE /api/posts/:id
 * @desc Delete a post
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        error: 'Invalid post ID',
        message: 'Post ID must be a valid number',
      });
    }

    const deletedPost = await deletePost(postId, req.user.id);

    if (!deletedPost) {
      return res.status(404).json({
        error: 'Post not found or unauthorized',
        message: 'Post not found or you are not authorized to delete it',
      });
    }

    res.status(200).json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      error: 'Failed to delete post',
      message: 'An error occurred while deleting the post',
    });
  }
});

/**
 * @route POST /api/posts/:id/like
 * @desc Like/unlike a post
 * @access Private
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({
        error: 'Invalid post ID',
        message: 'Post ID must be a valid number',
      });
    }

    const hasLiked = await hasUserLikedPost(postId, req.user.id);

    if (hasLiked) {
      // Unlike the post
      await unlikePost(postId, req.user.id);
      const likeCount = await getPostLikeCount(postId);

      res.status(200).json({
        message: 'Post unliked successfully',
        liked: false,
        likeCount,
      });
    } else {
      // Like the post
      await likePost(postId, req.user.id);
      const likeCount = await getPostLikeCount(postId);

      res.status(200).json({
        message: 'Post liked successfully',
        liked: true,
        likeCount,
      });
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    res.status(500).json({
      error: 'Failed to toggle post like',
      message: 'An error occurred while toggling the post like',
    });
  }
});

module.exports = router;
