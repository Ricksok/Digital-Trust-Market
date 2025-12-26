import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/web3/connect', authController.connectWallet);
router.post('/web3/verify', authController.verifyWallet);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;


