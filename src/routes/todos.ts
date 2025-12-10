import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { todos, lists } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { createTodoSchema, updateTodoSchema } from '../validators/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { parseNumericId } from '../utils/index.js';

const router = Router();

// All todo routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /lists/{listId}/todos:
 *   get:
 *     summary: Get all todos for a specific list
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: List ID
 *     responses:
 *       200:
 *         description: Array of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid list ID
 *       404:
 *         description: List not found
 *       401:
 *         description: Not authenticated
 */
router.get('/lists/:listId/todos', async (req: AuthRequest, res: Response) => {
  try {
    const listId = parseNumericId(req.params.listId);

    if (!listId) {
      return res.status(400).json({ error: 'Invalid list ID' });
    }

    // Verify list ownership
    const [list] = await db
      .select()
      .from(lists)
      .where(and(eq(lists.id, listId), eq(lists.createdBy, req.user!.userId)));

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const listTodos = await db.select().from(todos).where(eq(todos.listId, listId));

    return res.json(listTodos);
  } catch (error) {
    throw error;
  }
});

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Get a specific todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid todo ID
 *       404:
 *         description: Todo not found
 *       403:
 *         description: Forbidden - todo belongs to another user
 *       401:
 *         description: Not authenticated
 */
router.get('/todos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const todoId = parseNumericId(req.params.id);

    if (!todoId) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    const [todo] = await db.select().from(todos).where(eq(todos.id, todoId));

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Verify list ownership
    const [list] = await db
      .select()
      .from(lists)
      .where(and(eq(lists.id, todo.listId), eq(lists.createdBy, req.user!.userId)));

    if (!list) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(todo);
  } catch (error) {
    throw error;
  }
});

/**
 * @swagger
 * /lists/{listId}/todos:
 *   post:
 *     summary: Create a new todo in a list
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: List ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy milk
 *     responses:
 *       201:
 *         description: Todo created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid list ID or validation error
 *       404:
 *         description: List not found
 *       401:
 *         description: Not authenticated
 */
router.post('/lists/:listId/todos', async (req: AuthRequest, res: Response) => {
  try {
    const listId = parseNumericId(req.params.listId);
    if (!listId) {
      return res.status(400).json({ error: 'Invalid list ID' });
    }

    const body = createTodoSchema.parse(req.body);

    // Verify list ownership
    const [list] = await db
      .select()
      .from(lists)
      .where(and(eq(lists.id, listId), eq(lists.createdBy, req.user!.userId)));

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const [newTodo] = await db
      .insert(todos)
      .values({
        listId: listId,
        title: body.title,
      })
      .returning();

    return res.status(201).json(newTodo);
  } catch (error) {
    throw error;
  }
});

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy eggs
 *               done:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Todo updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid todo ID or validation error
 *       404:
 *         description: Todo not found
 *       403:
 *         description: Forbidden - todo belongs to another user
 *       401:
 *         description: Not authenticated
 */

router.put('/todos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const todoId = parseNumericId(req.params.id);
    if (!todoId) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    const body = updateTodoSchema.parse(req.body);

    const [existingTodo] = await db.select().from(todos).where(eq(todos.id, todoId));

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Verify list ownership
    const [list] = await db
      .select()
      .from(lists)
      .where(and(eq(lists.id, existingTodo.listId), eq(lists.createdBy, req.user!.userId)));

    if (!list) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [updatedTodo] = await db.update(todos).set(body).where(eq(todos.id, todoId)).returning();

    return res.json(updatedTodo);
  } catch (error) {
    throw error;
  }
});

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Todo deleted successfully
 *       400:
 *         description: Invalid todo ID
 *       404:
 *         description: Todo not found
 *       403:
 *         description: Forbidden - todo belongs to another user
 *       401:
 *         description: Not authenticated
 */
router.delete('/todos/:id', async (req: AuthRequest, res: Response) => {
  try {
    const todoId = parseNumericId(req.params.id);
    if (!todoId) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    const [existingTodo] = await db.select().from(todos).where(eq(todos.id, todoId));

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Verify list ownership
    const [list] = await db
      .select()
      .from(lists)
      .where(and(eq(lists.id, existingTodo.listId), eq(lists.createdBy, req.user!.userId)));

    if (!list) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.delete(todos).where(eq(todos.id, todoId));

    return res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    throw error;
  }
});

export default router;
