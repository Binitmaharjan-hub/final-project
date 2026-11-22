import { Router } from 'express';
import { z } from 'zod';
import { studentStore } from '../database/database.js';

export const studentRouter = Router();

const schema = z.object({
  studentId: z.string().trim().min(2).max(30),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  course: z.string().trim().min(2).max(100),
  year: z.coerce.number().int().min(1).max(8),
  status: z.enum(['Active', 'Inactive']).default('Active')
});

const serialize = (row) => row ? ({
  id: row.id,
  studentId: row.student_id,
  name: row.name,
  email: row.email,
  course: row.course,
  year: row.year,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
}) : null;

studentRouter.get('/', async (req, res, next) => {
  try { res.json((await studentStore.list(req.query.search)).map(serialize)); }
  catch (error) { next(error); }
});

studentRouter.get('/:id', async (req, res, next) => {
  try {
    const student = await studentStore.getById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(serialize(student));
  } catch (error) { next(error); }
});

studentRouter.post('/', async (req, res, next) => {
  try {
    const student = schema.parse(req.body);
    const result = await studentStore.create(student);
    res.status(201).json(serialize(await studentStore.getById(result.id)));
  } catch (error) { next(error); }
});

studentRouter.put('/:id', async (req, res, next) => {
  try {
    const student = schema.parse(req.body);
    const existing = await studentStore.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Student not found' });
    await studentStore.update(req.params.id, student);
    res.json(serialize(await studentStore.getById(req.params.id)));
  } catch (error) { next(error); }
});

studentRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await studentStore.getById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Student not found' });
    await studentStore.remove(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
});
