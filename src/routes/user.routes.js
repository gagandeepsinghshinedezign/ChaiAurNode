import {Router} from 'express'
import userRoute from '../controllers/user/user.routes.js'


const router=Router();
router.use('/users',userRoute)


export default router

