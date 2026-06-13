import { Router } from 'express';
import {
    createProject,
    deleteProject,
    updateProject,
    generateInviteCode
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-project").post(verifyJWT,createProject);
router.route("/delete-project").post(verifyJWT,deleteProject);
router.route("/update-project").post(verifyJWT,updateProject);
router.route("/generate-invite-code").post(verifyJWT,generateInviteCode);


export default router;