import { Router } from "express";
import {getCurrentUser , userRegister , userLogin , userLogout} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/current-user').get(verifyJWT , getCurrentUser);

router.route('/register').post(upload.single("avatar"),userRegister);

router.route('/login').post(userLogin);

router.route('/logout').post(verifyJWT,userLogout);

export default router;