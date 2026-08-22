import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const likeRoute = Router();

likeRoute.get("/like{:/videoId}", verifyJWT, toggleVideoLike);
likeRoute.get("/like{:/tweetId}", verifyJWT, toggleTweetLike);
likeRoute.get("/like{:/commentId}", verifyJWT, toggleCommentLike);
likeRoute.get("/like{:/userId}", verifyJWT, getLikedVideos);

export default likeRoute;
