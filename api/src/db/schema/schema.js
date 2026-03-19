const {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} = require('drizzle-orm/pg-core');

/* -------------------- USERS -------------------- */
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  username: varchar('username', { length: 150 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  bio: text('bio'),
  profileImage: text('profile_image'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/* -------------------- POSTS -------------------- */
const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  images: text('images'), // can store JSON stringified array
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/* -------------------- COMMENTS -------------------- */
const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

/* -------------------- POST LIKES -------------------- */
const postLikes = pgTable('post_likes', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

/* -------------------- COMMENT LIKES -------------------- */
const commentLikes = pgTable('comment_likes', {
  id: serial('id').primaryKey(),
  commentId: integer('comment_id')
    .notNull()
    .references(() => comments.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

/* -------------------- FOLLOWERS -------------------- */
const followers = pgTable('followers', {
  id: serial('id').primaryKey(),
  followerId: integer('follower_id')
    .notNull()
    .references(() => users.id),
  followingId: integer('following_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = {
  users,
  posts,
  comments,
  postLikes,
  commentLikes,
  followers,
};
