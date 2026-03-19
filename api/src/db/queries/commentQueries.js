const { db } = require('../schema/index.js');
const { comments, users } = require('../schema/schema.js');
const { eq, desc, and } = require('drizzle-orm');

/**
 * Create a new comment
 */
const createComment = async (commentData) => {
  const result = await db.insert(comments).values(commentData).returning({
    id: comments.id,
    postId: comments.postId,
    userId: comments.userId,
    content: comments.content,
    createdAt: comments.createdAt,
  });

  return result[0];
};

/**
 * Get comments by post ID with user info
 */
const getCommentsByPostId = async (postId, limit = 50, offset = 0) => {
  return await db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        profileImage: users.profileImage,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);
};

/**
 * Get comment by ID
 */
const getCommentById = async (id) => {
  const result = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        profileImage: users.profileImage,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, id));

  return result[0] || null;
};

/**
 * Delete comment
 */
const deleteComment = async (id, userId) => {
  const result = await db
    .delete(comments)
    .where(and(eq(comments.id, id), eq(comments.userId, userId)))
    .returning({ id: comments.id });

  return result[0] || null;
};

module.exports = {
  createComment,
  getCommentsByPostId,
  getCommentById,
  deleteComment,
};
