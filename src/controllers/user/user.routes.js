import { Router } from 'express'
import { login, logout, registerUser } from './user.controller.js';
import { upload } from '../../middlewares/multer.middleware.js';
import { verifyJwt } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', upload.fields([{
    name: "avatar",
    maxCount: 1
}, {
    name: "coverImage", 
    maxCount: 1
}]), registerUser)

router.post('/login',login)

router.post('/logout',verifyJwt,logout)

// router.route('/register').post(registerUser)

export default router