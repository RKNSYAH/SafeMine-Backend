import { Router } from "express";
import { getWorkers, loginSupervisor, loginWorker, addDummyDetection, addDetection, logoutWorker } from "../controllers/controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router()

router.get('/worker/:id', verifyToken, getWorkers)
router.post('/supervisor/login', loginSupervisor)
router.post('/worker/login', loginWorker)
router.post('/worker/logout', logoutWorker)
router.get('/detection', addDummyDetection)
router.post('/detection', verifyToken, addDetection )
// router.post('/user', login)

export default router