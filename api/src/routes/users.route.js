const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleMulterError } = require('../utils/fileUpload');
const {
  cloudinaryUploadMiddleware,
} = require('../middleware/cloudinaryUpload');
const {
  findUserById: getUserById,
  updateUserProfile,
  searchUsers,
} = require('../db/queries/userQueries');
const { getPostsByUserId } = require('../db/queries/postQueries');
const { getFollowCounts, isFollowing } = require('../db/queries/followQueries');

const router = express.Router();

/**
 * @route GET /api/users/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    // if (!user) 
      return res.status(404).json({
        error: 'User not found',
        message: 'Your profile could not be found',
      });
    }

    const followCounts = await getFollowCounts(user.id);

    const userProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ...followCounts,
    };

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: userProfile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching your profile',
    });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Get user profile by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number',
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user could not be found',
      });
    }

    const followCounts = await getFollowCounts(userId);
    const isCurrentUserFollowing = await isFollowing(req.user.id, userId);

    const userProfile = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      isFollowing: isCurrentUserFollowing,
      ...followCounts,
    };

    res.status(200).json({
      message: 'User profile retrieved successfully',
      user: userProfile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      message: 'An error occurred while fetching the user profile',
    });
  }
});

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/profile',
  authenticateToken,
  upload.single('profilePicture'),
  cloudinaryUploadMiddleware({ folder: 'social-media/profiles' }),
  handleMulterError,
  async (req, res) => {
    try {
      const { fullName, bio } = req.body;

      const updateData = {};

      if (fullName !== undefined) {
        updateData.fullName = fullName.trim();
      }

      if (bio !== undefined) {
        updateData.bio = bio.trim();
      }

      // Handle profile picture upload
      if (req.file && req.file.cloudinaryUrl) {
        updateData.profilePicture = req.file.cloudinaryUrl;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: 'No updates provided',
          message: 'At least one field must be provided to update',
        });
      }

      const updatedUser = await updateUserProfile(req.user.id, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Your profile could not be found',
        });
      }

      const userProfile = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      res.status(200).json({
        message: 'Profile updated successfully',
        user: userProfile,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: 'An error occurred while updating your profile',
      });
    }
  }
);

/**
 * @route GET /api/users/search
 * @desc Search for users
 * @access Private
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: 'Search query required',
        message: 'Please provide a search query',
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const users = await searchUsers(query.trim(), limitNum, offset);

    // Add follow status for each user
    const usersWithFollowStatus = await Promise.all(
      users.map(async (user) => {
        const isCurrentUserFollowing = await isFollowing(req.user.id, user.id);
        const followCounts = await getFollowCounts(user.id);

        return {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          bio: user.bio,
          profilePicture: user.profilePicture,
          isFollowing: isCurrentUserFollowing,
          ...followCounts,
        };
      })
    );

    res.status(200).json({
      message: 'Search completed successfully',
      users: usersWithFollowStatus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        hasMore: users.length === limitNum,
      },
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'An error occurred while searching for users',
    });
  }
});

/**
 * @route GET /api/users/:id/posts
 * @desc Get posts by a specific user
 * @access Private
 */
router.get('/:id/posts', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number',
      });
    }

    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user could not be found',
      });
    }

    const posts = await getPostsByUserId(userId, limit, offset);

    res.status(200).json({
      message: 'User posts retrieved successfully',
      posts: posts.map((post) => ({
        ...post,
        images: post.images ? JSON.parse(post.images) : null,
      })),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
      },
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

module.exports = router;
