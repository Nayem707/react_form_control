const express = require('express');
const { db } = require('../db/schema/index.js');
const { posts } = require('../db/schema/schema.js');
const { authenticateToken } = require('../middleware/auth.js');
const router = express.Router();

/**
 * @route POST /api/posts
 * @desc Create a new post
 * @access Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title and content are required',
      });
    }

    const result = await db
      .insert(posts)
      .values({
        title,
        content,
        userId: req.user.id,
      })
      .returning();
    res.status(201).json({
      message: 'Post created successfully',
      post: result[0],
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      error: 'Failed to create post',
      message: 'An error occurred while creating the post',
    });
  }
});

/**
 * @route GET /api/posts
 * @desc Get all posts
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const allPosts = await db.select().from(posts);

    res.status(200).json({
      message: 'Posts retrieved successfully',
      posts: allPosts,
      count: allPosts.length,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      error: 'Failed to fetch posts',
      message: 'An error occurred while fetching posts',
    });
  }
});

module.exports = router;
