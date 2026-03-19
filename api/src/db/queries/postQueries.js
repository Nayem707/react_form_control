const { db } = require('../schema/index.js');
const { posts, users } = require('../schema/schema.js');
const { eq, desc, and, sql } = require('drizzle-orm');

/**
 * Create a new post
 */
const createPost = async (postData) => {
  const result = await db.insert(posts).values(postData).returning({
    id: posts.id,
    userId: posts.userId,
    content: posts.content,
    images: posts.images,
    createdAt: posts.createdAt,
  });

  return result[0];
};

/**
 * Get post by ID with user info
 */
const getPostById = async (id) => {
  const result = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      images: posts.images,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      user: {
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        profileImage: users.profileImage,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, id));

  return result[0] || null;
};

/**
 * Get all posts with user info (feed)
 */
const getAllPosts = async (limit = 20, offset = 0) => {
  return await db
    .select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      images: posts.images,
      createdAt: posts.createdAt,
      user: {
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        profileImage: users.profileImage,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
};

/**
 * Get posts by user ID
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  return await db
    .select({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      images: posts.images,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
};

/**
 * Update post
 */
const updatePost = async (id, userId, updateData) => {
  const result = await db
    .update(posts)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(and(eq(posts.id, id), eq(posts.userId, userId)))
    .returning({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      images: posts.images,
      updatedAt: posts.updatedAt,
    });

  return result[0] || null;
};

/**
 * Delete post
 */
const deletePost = async (id, userId) => {
  const result = await db
    .delete(posts)
    .where(and(eq(posts.id, id), eq(posts.userId, userId)))
    .returning({ id: posts.id });

  return result[0] || null;
};

module.exports = {
  createPost,
  getPostById,
  getAllPosts,
  getPostsByUserId,
  updatePost,
  deletePost,
};
