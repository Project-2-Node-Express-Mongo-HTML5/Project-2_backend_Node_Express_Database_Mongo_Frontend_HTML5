import express from 'express';
const router = express.Router();
const projectController = require('../controllers/projectController');

// CRUD routes
router.post('/', projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/priority', projectController.getProjectsByPriority);
router.get('/stats', projectController.getStats);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Status update routes
router.patch('/:id/complete', projectController.completeProject);
router.patch('/:id/abandon', projectController.abandonProject);

module.exports = { router };