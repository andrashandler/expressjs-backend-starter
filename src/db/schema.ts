import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Define Users Table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  registered: integer('registered', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// Define Lists Table
export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// Define Todos Table
export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id')
    .notNull()
    .references(() => lists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  done: integer('done', { mode: 'boolean' }).default(false).notNull(),
});
