import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = express.Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/:id', authenticate, userController.getUserById);
router.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);

export default router;


