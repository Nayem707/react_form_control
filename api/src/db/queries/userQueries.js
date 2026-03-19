const { db } = require('../schema/index.js');
const { users } = require('../schema/schema.js');
const { eq } = require('drizzle-orm');

/**
 * Create a new user
 * @param {object} userData - User data (name, email, password, profileImage)
 * @returns {Promise<object>} - Created user (without password)
 */
const createUser = async (userData) => {
  const result = await db.insert(users).values(userData).returning({
    id: users.id,
    fullName: users.fullName,
    username: users.username,
    email: users.email,
    profileImage: users.profileImage,
    createdAt: users.createdAt,
  });

  return result[0];
};
/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<object|null>} - User object or null
 */
const findUserByEmail = async (email) => {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0] || null;
};

/**
 * Find user by username
 * @param {string} username - Username
 * @returns {Promise<object|null>} - User object or null
 */
const findUserByUsername = async (username) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username));
  return result[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<object|null>} - User object (without password) or null
 */
const findUserById = async (id) => {
  const result = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      email: users.email,
      bio: users.bio,
      profileImage: users.profileImage,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id));

  return result[0] || null;
};

/**
 * Update user profile image
 * @param {number} id - User ID
 * @param {string} profileImage - Profile image path
 * @returns {Promise<object>} - Updated user
 */
const updateUserProfileImage = async (id, profileImage) => {
  const result = await db
    .update(users)
    .set({
      profileImage,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      profileImage: users.profileImage,
      updatedAt: users.updatedAt,
    });

  return result[0];
};

/**
 * Update user profile (full name, bio, profile picture)
 * @param {number} id - User ID
 * @param {object} updateData - Data to update (fullName, bio, profileImage)
 * @returns {Promise<object|null>} - Updated user object or null
 */
const updateUserProfile = async (id, updateData) => {
  const result = await db
    .update(users)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      email: users.email,
      bio: users.bio,
      profileImage: users.profileImage,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return result[0] || null;
};

/**
 * Search users by username or full name
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<array>} - Array of matching users
 */
const searchUsers = async (query, limit = 20, offset = 0) => {
  const { ilike, or } = require('drizzle-orm');

  const result = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      bio: users.bio,
      profileImage: users.profileImage,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      or(
        ilike(users.username, `%${query}%`),
        ilike(users.fullName, `%${query}%`)
      )
    )
    .limit(limit)
    .offset(offset);

  return result;
};

/**
 * Get all users (public data only)
 * @returns {Promise<Array>} - Array of users
 */
const getAllUsers = async () => {
  return await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      profileImage: users.profileImage,
      createdAt: users.createdAt,
    })
    .from(users);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  updateUserProfileImage,
  updateUserProfile,
  searchUsers,
  getAllUsers,
};
