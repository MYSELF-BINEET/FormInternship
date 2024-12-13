import { Router } from 'express';
import {
  forgotPassword,
  googleLogin,
  login,
  logout,
  resetPassword,
  signUp,
} from '../controllers/authController';
import refreshTokenHandler from '../controllers/refreshTokenController';
import { loginLimiter } from '../middleware/loginLimiter';
import verifyJWT from '../middleware/verifyJWT';


const router = Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);

router.post('/google', googleLogin);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.get('/refresh',refreshTokenHandler);

export default router;
