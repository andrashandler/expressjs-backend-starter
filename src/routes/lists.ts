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

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userLists = await db.select().from(lists).where(eq(lists.createdBy, req.user!.userId));

    return res.json(userLists);
  } catch (error) {
    throw error;
  }
});

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
