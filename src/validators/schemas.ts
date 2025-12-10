import { z } from 'zod';

// Keep in mind !!!
// All zod properties are required by default
// unless marked as optional with .optional()
//
// For strings:
// title="" is still considered valid
// required means the property must be present
// you need to add min(1) to ensure non-empty strings

// Auth schemas
export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// List schemas
export const createListSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export const updateListSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

// Todo schemas
export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
});
