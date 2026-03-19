const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  followUser,
  unfollowUser,
  isFollowing,
  getUserFollowers: getFollowers,
  getUserFollowing: getFollowing,
  getFollowCounts,
} = require('../db/queries/followQueries');

const router = express.Router();

/**
 * @route POST /api/users/:id/follow
 * @desc Follow or unfollow a user
 * @access Private
 */
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    if (isNaN(targetUserId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number',
      });
    }

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'You cannot follow yourself',
      });
    }

    const isAlreadyFollowing = await isFollowing(currentUserId, targetUserId);

    if (isAlreadyFollowing) {
      // Unfollow the user
      await unfollowUser(currentUserId, targetUserId);
      const followCounts = await getFollowCounts(targetUserId);

      res.status(200).json({
        message: 'User unfollowed successfully',
        isFollowing: false,
        followCounts,
      });
    } else {
      // Follow the user
      await followUser(currentUserId, targetUserId);
      const followCounts = await getFollowCounts(targetUserId);

      res.status(200).json({
        message: 'User followed successfully',
        isFollowing: true,
        followCounts,
      });
    }
  } catch (error) {
    console.error('Error toggling follow status:', error);
    res.status(500).json({
      error: 'Failed to toggle follow status',
      message: 'An error occurred while updating follow status',
    });
  }
});

/**
 * @route GET /api/users/:id/followers
 * @desc Get a user's followers
 * @access Private
 */
router.get('/:id/followers', authenticateToken, async (req, res) => {
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

    const followers = await getFollowers(userId, limit, offset);

    // Add follow status for each follower (if current user follows them)
    const followersWithStatus = await Promise.all(
      followers.map(async (follower) => {
        const currentUserFollows = await isFollowing(req.user.id, follower.id);

        return {
          ...follower,
          isFollowedByCurrentUser: currentUserFollows,
        };
      })
    );

    res.status(200).json({
      message: 'Followers retrieved successfully',
      followers: followersWithStatus,
      pagination: {
        page,
        limit,
        hasMore: followers.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      error: 'Failed to fetch followers',
      message: 'An error occurred while fetching followers',
    });
  }
});

/**
 * @route GET /api/users/:id/following
 * @desc Get users that a user is following
 * @access Private
 */
router.get('/:id/following', authenticateToken, async (req, res) => {
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

    const following = await getFollowing(userId, limit, offset);

    // Add follow status for each user being followed (if current user follows them)
    const followingWithStatus = await Promise.all(
      following.map(async (user) => {
        const currentUserFollows = await isFollowing(req.user.id, user.id);

        return {
          ...user,
          isFollowedByCurrentUser: currentUserFollows,
        };
      })
    );

    res.status(200).json({
      message: 'Following list retrieved successfully',
      following: followingWithStatus,
      pagination: {
        page,
        limit,
        hasMore: following.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({
      error: 'Failed to fetch following list',
      message: 'An error occurred while fetching following list',
    });
  }
});

/**
 * @route GET /api/users/:id/follow-status
 * @desc Check if current user follows the target user and get follow counts
 * @access Private
 */
router.get('/:id/follow-status', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    if (isNaN(targetUserId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number',
      });
    }

    const isFollowingUser = await isFollowing(currentUserId, targetUserId);
    const followCounts = await getFollowCounts(targetUserId);

    res.status(200).json({
      message: 'Follow status retrieved successfully',
      isFollowing: isFollowingUser,
      followCounts,
    });
  } catch (error) {
    console.error('Error fetching follow status:', error);
    res.status(500).json({
      error: 'Failed to fetch follow status',
      message: 'An error occurred while fetching follow status',
    });
  }
});

module.exports = router;
