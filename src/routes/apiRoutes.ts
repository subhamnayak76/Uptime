import { Router } from "express";
import userController from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import monitorController from "../controllers/monitorController";


const router = Router()


router.get('/users/:id',authenticate,userController.getUser)
router.post('/register',userController.registerUser)
router.post('/user/login',userController.login)

// Monitor Routes
router.post('/monitors',authenticate,monitorController.createMonitor)
router.get('/monitor',authenticate,monitorController.getAllMonitors) // Consider renaming to /monitors
router.get('/monitors/:id',authenticate,monitorController.getMonitorById)
router.delete('/monitors/:id', authenticate, monitorController.deleteMonitor) // <-- Add this line


export default router
