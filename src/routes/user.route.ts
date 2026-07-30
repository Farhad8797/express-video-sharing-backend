import { Router } from "express";
import {
    registerUser,
    signInUser,
    signOutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserAccountInfo,
    updateAvatar,
    updateCoverImage
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
userRoute.post("/refresh-token", refreshAccessToken);
userRoute.post("/change-password", verifyJWT, changePassword);
userRoute.get("/getCurrentUser", verifyJWT, getCurrentUser);
userRoute.post("/update-accountInfo", verifyJWT, updateUserAccountInfo);
userRoute.post(
    "/update-avatar",
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
);
userRoute.post(
    "/update-coverImage",
    verifyJWT,
    upload.single("coverImage"),
    updateCoverImage
);

export default userRoute;
