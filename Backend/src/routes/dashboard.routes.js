import { Router } from 'express';
import {
    createProject,
    deleteCollaborator,
    deleteProject,
    getUserProjects,
    joinProject,
    leaveProject,
    openProject,
    updateCollaboratorRole,
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

router.route("/update-collaborator-role/:projectId/:collaboratorId").patch(verifyJWT, updateCollaboratorRole);
router.route("/delete-collaborator/:projectId/:collaboratorId").delete(verifyJWT, deleteCollaborator);

router.route("/open-project/:projectId").get(verifyJWT,openProject);
export default router;