import { Router } from "express";
import {
    registerUser,
    signInUser,
    signOutUser
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";

const userRoute = Router();

userRoute.post(
    "/register",
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

userRoute.post("/signIn", signInUser);
userRoute.post("/signOut", verifyJWT, signOutUser);

export default userRoute;
