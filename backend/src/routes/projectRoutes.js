const express = require('express');
const router = express.Router();
// ADDED 'getProject' to the imports below
const { createProject, listProjects, updateProject, deleteProject, getProject } = require('../controllers/projectController');
const { verifyToken } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Create
router.post('/', 
    verifyToken,
    [check('name', 'Project name is required').not().isEmpty()],
    createProject
);

// List (Get All)
router.get('/', verifyToken, listProjects);

// --- THIS WAS MISSING: Get Single Project ---
router.get('/:projectId', verifyToken, getProject);
// --------------------------------------------

// Update
router.put('/:projectId', verifyToken, updateProject);

// Delete
router.delete('/:projectId', verifyToken, deleteProject);

module.exports = router;