const express = require('express');
const router = express.Router();
const { createTask, listTasks, updateTaskStatus, updateTask } = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Create Task (Nested under projects)
router.post('/projects/:projectId/tasks', 
    verifyToken,
    [check('title', 'Title is required').not().isEmpty()],
    createTask
);

// List Tasks (Nested under projects)
router.get('/projects/:projectId/tasks', verifyToken, listTasks);

// Update Status
router.patch('/tasks/:taskId/status', verifyToken, updateTaskStatus);

// Update Task
router.put('/tasks/:taskId', verifyToken, updateTask);

module.exports = router;