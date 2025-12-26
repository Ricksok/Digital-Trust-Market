import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as projectController from '../controllers/project.controller';

const router = express.Router();

router.post('/', authenticate, authorize('SME_STARTUP', 'SOCIAL_ENTERPRISE', 'REAL_ESTATE_PROJECT'), projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', authenticate, projectController.updateProject);
router.delete('/:id', authenticate, projectController.deleteProject);
router.post('/:id/submit', authenticate, projectController.submitForApproval);
router.post('/:id/approve', authenticate, authorize('ADMIN'), projectController.approveProject);

export default router;


