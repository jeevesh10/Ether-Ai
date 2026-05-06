import { Router, Request, Response } from 'express';
import Joi from 'joi';
import prisma from '../prisma';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/auth';

const router = Router();

const projectSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  memberIds: Joi.array().items(Joi.string()).optional()
});

// Create a project (Admin only)
router.post('/', authenticate, authorizeRole(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { title, description, memberIds } = req.body;
    
    const membersData = memberIds ? memberIds.map((id: string) => ({ id })) : [];
    // Always include the creator as a member
    if (!membersData.some((m: any) => m.id === req.user!.id)) {
      membersData.push({ id: req.user!.id });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        createdById: req.user!.id,
        members: {
          connect: membersData
        }
      },
      include: {
        members: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get projects for user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      where: req.user!.role === 'ADMIN' ? {} : {
        members: {
          some: { id: req.user!.id }
        }
      },
      include: {
        _count: { select: { tasks: true } },
        members: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project: any = await prisma.project.findUnique({
      where: { id: req.params.id as string },
      include: {
        members: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if user has access to this project
    const isMember = project.members.some((m: any) => m.id === req.user!.id);
    if (req.user!.role !== 'ADMIN' && !isMember) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', authenticate, authorizeRole(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, memberIds } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    
    if (memberIds) {
      updateData.members = {
        set: memberIds.map((id: string) => ({ id }))
      };
    }

    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: updateData,
      include: {
        members: { select: { id: true, name: true } }
      }
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', authenticate, authorizeRole(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id as string }
    });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
