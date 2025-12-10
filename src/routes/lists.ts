import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { lists } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { createListSchema, updateListSchema } from '../validators/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { parseNumericId } from '../utils/index.js';

const router = Router();

// All list routes MUST be authenticated
router.use(authMiddleware);

/**
 * @swagger
 * /lists:
 *   get:
 *     summary: Get all lists for current user
 *     tags: [Lists]
 *     responses:
 *       200:
 *         description: Array of lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/List'
 *       401:
 *         description: Not authenticated
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userLists = await db.select().from(lists).where(eq(lists.createdBy, req.user!.userId));

    return res.json(userLists);
  } catch (error) {
    throw error;
  }
});

/**
 * @swagger
 * /lists/{id}:
 *   get:
 *     summary: Get a specific list
 *     tags: [Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: List ID
 *     responses:
 *       200:
 *         description: List data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       404:
 *         description: List not found
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const listId = parseNumericId(req.params.id);

    if (!listId) {
      return res.status(400).json({ error: 'Invalid list ID' });
    }

    const [list] = await db
      .select()
      .from(lists)
      .where(and(eq(lists.id, listId), eq(lists.createdBy, req.user!.userId)));

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    return res.json(list);
  } catch (error) {
    throw error;
  }
});

/**
 * @swagger
 * /lists:
 *   post:
 *     summary: Create a new list
 *     tags: [Lists]
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
 *                 example: Shopping List
 *               description:
 *                 type: string
 *                 example: Weekly groceries
 *     responses:
 *       201:
 *         description: List created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = createListSchema.parse(req.body);

    const [newList] = await db
      .insert(lists)
      .values({
        title: body.title,
        description: body.description,
        createdBy: req.user!.userId,
      })
      .returning();

    return res.status(201).json(newList);
  } catch (error) {
    throw error;
  }
});

/**
 * @swagger
 * /lists/{id}:
 *   put:
 *     summary: Update a list
 *     tags: [Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: List updated
 *       404:
 *         description: List not found
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const listId = parseInt(req.params.id);
    const body = updateListSchema.parse(req.body);

    // Check if list exists and belongs to user
    const [existingList] = await db
      .select()
      .from(lists)
      .where(and(eq(lists.id, listId), eq(lists.createdBy, req.user!.userId)));

    if (!existingList) {
      return res.status(404).json({ error: 'List not found' });
    }

    const [updatedList] = await db.update(lists).set(body).where(eq(lists.id, listId)).returning();

    return res.json(updatedList);
  } catch (error) {
    throw error;
  }
});

/**
 * @swagger
 * /lists/{id}:
 *   delete:
 *     summary: Delete a list
 *     tags: [Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List deleted
 *       404:
 *         description: List not found
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const listId = parseInt(req.params.id);

    // Check if list exists and belongs to user
    const [existingList] = await db
      .select()
      .from(lists)
      .where(and(eq(lists.id, listId), eq(lists.createdBy, req.user!.userId)));

    if (!existingList) {
      return res.status(404).json({ error: 'List not found' });
    }

    await db.delete(lists).where(eq(lists.id, listId));

    return res.json({ message: 'List deleted successfully' });
  } catch (error) {
    throw error;
  }
});

export default router;
