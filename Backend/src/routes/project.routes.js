import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { permittedUserRole } from '../middlewares/roleCheck.middleware.js';

import {
    createFolder,
    createFile,
    renameFileFolder,
    deleteFileFolder,
    getFolderTree,
    getFileContent,
    saveFileContent
} from "../controllers/project.controller.js";

const router = Router();


router.route("/create-folder/:projectId/:parentFolderId").post(verifyJWT , permittedUserRole("owner" , "editor"),createFolder);
router.route("/create-file/:projectId/:parentFolderId").post(verifyJWT , permittedUserRole("owner" , "editor"),createFile);

router.route("/rename-file-folder/:projectId/:fileId").put(verifyJWT , permittedUserRole("owner" , "editor"),renameFileFolder);
router.route("/delete-file-folder/:projectId/:fileId").delete(verifyJWT , permittedUserRole("owner" , "editor"),deleteFileFolder);

router.route("/get-folder-tree/:projectId").get(verifyJWT , permittedUserRole("owner" , "editor","viewer"),getFolderTree);
router.route("/get-file-content/:projectId/:fileId").get(verifyJWT , permittedUserRole("owner" , "editor" , "viewer"),getFileContent);
router.route("/save-file-content/:projectId/:fileId").post(verifyJWT , permittedUserRole("owner" , "editor"),saveFileContent);

export default router;