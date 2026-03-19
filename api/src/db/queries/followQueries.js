const { db } = require('../schema/index.js');
const { followers, users } = require('../schema/schema.js');
const { eq, and, sql } = require('drizzle-orm');

/**
 * Follow a user
 */
const followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new Error('Users cannot follow themselves');
  }

  try {
    const result = await db
      .insert(followers)
      .values({
        followerId,
        followingId,
      })
      .returning({
        id: followers.id,
        followerId: followers.followerId,
        followingId: followers.followingId,
        createdAt: followers.createdAt,
      });

    return result[0];
  } catch (error) {
    // Handle duplicate follow
    if (error.code === '23505') {
      throw new Error('User is already being followed');
    }
    throw error;
  }
};

/**
 * Unfollow a user
 */
const unfollowUser = async (followerId, followingId) => {
  const result = await db
    .delete(followers)
    .where(
      and(
        eq(followers.followerId, followerId),
        eq(followers.followingId, followingId)
      )
    )
    .returning({ id: followers.id });

  return result[0] || null;
};

/**
 * Check if user is following another user
 */
const isFollowing = async (followerId, followingId) => {
  const result = await db
    .select({ id: followers.id })
    .from(followers)
    .where(
      and(
        eq(followers.followerId, followerId),
        eq(followers.followingId, followingId)
      )
    );

  return result.length > 0;
};

/**
 * Get user's followers
 */
const getUserFollowers = async (userId, limit = 50, offset = 0) => {
  return await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      profileImage: users.profileImage,
      followedAt: followers.createdAt,
    })
    .from(followers)
    .leftJoin(users, eq(followers.followerId, users.id))
    .where(eq(followers.followingId, userId))
    .limit(limit)
    .offset(offset);
};

/**
 * Get users that a user is following
 */
const getUserFollowing = async (userId, limit = 50, offset = 0) => {
  return await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      profileImage: users.profileImage,
      followedAt: followers.createdAt,
    })
    .from(followers)
    .leftJoin(users, eq(followers.followingId, users.id))
    .where(eq(followers.followerId, userId))
    .limit(limit)
    .offset(offset);
};

/**
 * Get follow counts (followers and following) for a user
 */
const getFollowCounts = async (userId) => {
  const followerCount = await getFollowerCount(userId);
  const followingCount = await getFollowingCount(userId);

  return {
    followerCount,
    followingCount,
  };
};

/**
 * Get follower count
 */
const getFollowerCount = async (userId) => {
  const result = await db
    .select({ count: sql`count(*)` })
    .from(followers)
    .where(eq(followers.followingId, userId));

  return parseInt(result[0]?.count || 0);
};

/**
 * Get following count
 */
const getFollowingCount = async (userId) => {
  const result = await db
    .select({ count: sql`count(*)` })
    .from(followers)
    .where(eq(followers.followerId, userId));

  return parseInt(result[0]?.count || 0);
};

module.exports = {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowCounts,
  getUserFollowers,
  getUserFollowing,
  getFollowerCount,
  getFollowingCount,
};
