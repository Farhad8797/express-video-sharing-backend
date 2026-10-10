import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";
import {
    publishVideo,
    findAllVidoes,
    findOneVideo,
    updateVideoStatus,
    increaseViewCount,
    deleteVideo,
    deleteAllVideos
} from "../controllers/video.controller.js";

const videoRoute = Router();

videoRoute.post(
    "/upload-video",
    verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo
);
videoRoute.get("/all-videos{/:userId}", findAllVidoes);
videoRoute.get("/find-video{/:videoId}", findOneVideo);
videoRoute.patch(
    "/update-video-status{/:videoId}",
    verifyJWT,
    updateVideoStatus
);
videoRoute.patch("/increase-view-count{/:videoId}", increaseViewCount);
videoRoute.delete("/delete-video{/:videoId}", verifyJWT, deleteVideo);
videoRoute.delete("/delete-all-videos{/:userId}", verifyJWT, deleteAllVideos);

export default videoRoute;
