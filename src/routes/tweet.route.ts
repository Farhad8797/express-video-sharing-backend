import { Router } from "express";
import {
    createTweet,
    updateTweet,
    getUserTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const tweetRoute = Router();

tweetRoute.post("/create-tweet", verifyJWT, createTweet);
tweetRoute.get("/comments{:/userId}", getUserTweet);
tweetRoute.patch("/tweet/u/{:/tweetid}", verifyJWT, updateTweet);
tweetRoute.delete("/tweet/d/{:/tweetId}", verifyJWT, deleteTweet);

export default tweetRoute;
