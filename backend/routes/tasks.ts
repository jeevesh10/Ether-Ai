import { Router, Request, Response } from 'express';
import Joi from 'joi';
import prisma from '../prisma';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/auth';

const router = Router();

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
  dueDate: Joi.date().iso().optional(),
  projectId: Joi.string().required(),
  assignedToId: Joi.string().allow(null).optional()
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
  dueDate: Joi.date().iso().optional(),
  assignedToId: Joi.string().allow(null).optional()
});

// Create a task (Admin only)
router.post('/', authenticate, authorizeRole(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error } = taskSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;

    // Check if project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tasks
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, status, priority } = req.query;
    
    const whereClause: any = {};
    if (projectId) whereClause.projectId = String(projectId);
    if (status) whereClause.status = String(status);
    if (priority) whereClause.priority = String(priority);

    // If user is member, only show tasks from projects they are part of
    if (req.user!.role !== 'ADMIN') {
      whereClause.project = {
        members: {
          some: { id: req.user!.id }
        }
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error } = updateTaskSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const task: any = await prisma.task.findUnique({
      where: { id: req.params.id as string },
      include: { project: { include: { members: true } } }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const isProjectMember = task.project.members.some((m: any) => m.id === req.user!.id);
    
    if (req.user!.role !== 'ADMIN') {
      if (!isProjectMember) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      // Members can only update status
      const allowedUpdates = ['status'];
      const attemptedUpdates = Object.keys(req.body);
      const invalidUpdates = attemptedUpdates.filter(key => !allowedUpdates.includes(key));
      
      if (invalidUpdates.length > 0) {
        res.status(403).json({ error: 'Members can only update task status' });
        return;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id as string },
      data: req.body,
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } }
      }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', authenticate, authorizeRole(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id as string }
    });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
