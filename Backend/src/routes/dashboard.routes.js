import { Router } from 'express';
import {
    createProject,
    deleteProject,
    getUserProjects,
    joinProject,
    leaveProject,
    updateProject
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-project").post(verifyJWT,createProject);
router.route("/delete-project/:projectId").delete(verifyJWT,deleteProject);
router.route("/update-project/:projectId").put(verifyJWT,updateProject);

router.route("/get-user-project").get(verifyJWT,getUserProjects);
router.route("/join-project").post(verifyJWT,joinProject);
router.route("/leave-project/:projectId").delete(verifyJWT,leaveProject);

export default router;