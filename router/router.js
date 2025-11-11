import { Router } from "express";
import { getWorkers, loginSupervisor, loginWorker, addDummyDetection } from "../controllers/controller.js";

const router = Router()

router.get('/worker/:id', getWorkers)
router.post('/supervisor/login', loginSupervisor)
router.post('/worker/login', loginWorker)
router.get('/detection', addDummyDetection)
// router.post('/user', login)

export default router