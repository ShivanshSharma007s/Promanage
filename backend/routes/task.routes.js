const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authMiddleware } = require('../middleware/auth.middleware');

// Get all tasks (filter by projectId, status, priority, assigneeId)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { projectId, status, priority, assigneeId } = req.query;
    const where = {};
    if (projectId) where.projectId = parseInt(projectId);
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = parseInt(assigneeId);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assigneeId, priority } = req.body;
    if (!title || !projectId) return res.status(400).json({ message: 'Title and project are required' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: parseInt(projectId),
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        priority: priority || 'Medium'
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task (full)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const task = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId ? parseInt(assigneeId) : null })
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status (quick)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard stats
router.get('/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    const [totalTasks, totalProjects, users] = await Promise.all([
      prisma.task.findMany(),
      prisma.project.count(),
      prisma.user.count()
    ]);

    const todo = totalTasks.filter(t => t.status === 'Todo').length;
    const inProgress = totalTasks.filter(t => t.status === 'In Progress').length;
    const done = totalTasks.filter(t => t.status === 'Done').length;
    const overdue = totalTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;
    const highPriority = totalTasks.filter(t => t.priority === 'High' && t.status !== 'Done').length;

    res.json({
      totalTasks: totalTasks.length,
      totalProjects,
      totalUsers: users,
      todo, inProgress, done, overdue, highPriority
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
