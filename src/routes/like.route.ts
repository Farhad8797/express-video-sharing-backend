import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const likeRoute = Router();

likeRoute.post("/like/v/{/:videoId}", verifyJWT, toggleVideoLike);
likeRoute.post("/like/t/{/:tweetId}", verifyJWT, toggleTweetLike);
likeRoute.post("/like/c/{/:commentId}", verifyJWT, toggleCommentLike);
likeRoute.get("/like/u/{/:userId}", verifyJWT, getLikedVideos);

export default likeRoute;
