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
    updateCoverImage,
    getUserChannel,
    getUserWatchHistory
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
userRoute.patch("/change-password", verifyJWT, changePassword);
userRoute.get("/get-current-user", verifyJWT, getCurrentUser);
userRoute.patch("/update-account-info", verifyJWT, updateUserAccountInfo);
userRoute.patch(
    "/update-avatar",
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
);
userRoute.patch(
    "/update-coverImage",
    verifyJWT,
    upload.single("coverImage"),
    updateCoverImage
);

userRoute.get("/channel{/:username}", verifyJWT, getUserChannel);
userRoute.get("/watch-history", verifyJWT, getUserWatchHistory);

export default userRoute;
