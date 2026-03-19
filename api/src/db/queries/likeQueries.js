const { db } = require('../schema/index.js');
const { postLikes, commentLikes } = require('../schema/schema.js');
const { eq, and, sql } = require('drizzle-orm');

/**
 * Like a post
 */
const likePost = async (postId, userId) => {
  try {
    const result = await db
      .insert(postLikes)
      .values({
        postId,
        userId,
      })
      .returning({
        id: postLikes.id,
        postId: postLikes.postId,
        userId: postLikes.userId,
        createdAt: postLikes.createdAt,
      });

    return result[0];
  } catch (error) {
    // Handle duplicate like (user already liked this post)
    if (error.code === '23505') {
      throw new Error('Post already liked by user');
    }
    throw error;
  }
};

/**
 * Unlike a post
 */
const unlikePost = async (postId, userId) => {
  const result = await db
    .delete(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .returning({ id: postLikes.id });

  return result[0] || null;
};

/**
 * Check if user liked a post
 */
const hasUserLikedPost = async (postId, userId) => {
  const result = await db
    .select({ id: postLikes.id })
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

  return result.length > 0;
};

/**
 * Get post like count
 */
const getPostLikeCount = async (postId) => {
  const result = await db
    .select({ count: sql`count(*)` })
    .from(postLikes)
    .where(eq(postLikes.postId, postId));

  return parseInt(result[0]?.count || 0);
};

/**
 * Like a comment
 */
const likeComment = async (commentId, userId) => {
  try {
    const result = await db
      .insert(commentLikes)
      .values({
        commentId,
        userId,
      })
      .returning({
        id: commentLikes.id,
        commentId: commentLikes.commentId,
        userId: commentLikes.userId,
        createdAt: commentLikes.createdAt,
      });

    return result[0];
  } catch (error) {
    // Handle duplicate like
    if (error.code === '23505') {
      throw new Error('Comment already liked by user');
    }
    throw error;
  }
};

/**
 * Unlike a comment
 */
const unlikeComment = async (commentId, userId) => {
  const result = await db
    .delete(commentLikes)
    .where(
      and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      )
    )
    .returning({ id: commentLikes.id });

  return result[0] || null;
};

/**
 * Check if user liked a comment
 */
const hasUserLikedComment = async (commentId, userId) => {
  const result = await db
    .select({ id: commentLikes.id })
    .from(commentLikes)
    .where(
      and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      )
    );

  return result.length > 0;
};

/**
 * Get comment like count
 */
const getCommentLikeCount = async (commentId) => {
  const result = await db
    .select({ count: sql`count(*)` })
    .from(commentLikes)
    .where(eq(commentLikes.commentId, commentId));

  return parseInt(result[0]?.count || 0);
};

module.exports = {
  likePost,
  unlikePost,
  hasUserLikedPost,
  getPostLikeCount,
  likeComment,
  unlikeComment,
  hasUserLikedComment,
  getCommentLikeCount,
};
