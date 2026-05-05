const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Get all projects with task counts and progress
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: { select: { id: true, status: true, priority: true, dueDate: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enriched = projects.map(p => {
      const total = p.tasks.length;
      const done = p.tasks.filter(t => t.status === 'Done').length;
      const overdue = p.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;
      return {
        ...p,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
        overdueCount: overdue
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          include: { assignee: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await prisma.project.create({
      data: { name, description, ownerId: req.user.id },
      include: { owner: { select: { id: true, name: true, email: true } } }
    });
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description }
    });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
