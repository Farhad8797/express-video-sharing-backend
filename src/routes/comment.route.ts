import { Router } from "express";
import {
    getVideoComment,
    getTweetComment,
    addCommentToTweet,
    addCommentToVideo,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const commentRoute = Router();

commentRoute.get("/video{:/videoId}/comment", getVideoComment);
commentRoute.get("/tweet{:/tweetId}/comment", getTweetComment);
commentRoute.post(
    "/video{:/videoId}/add-comment",
    verifyJWT,
    addCommentToVideo
);
commentRoute.post(
    "/tweet{:/tweetId}/add-comment",
    verifyJWT,
    addCommentToTweet
);
commentRoute.patch("/update-comment{:/commentId}", verifyJWT, updateComment);
commentRoute.delete("/delete-comment{:/commentId}", verifyJWT, deleteComment);

export default commentRoute;
