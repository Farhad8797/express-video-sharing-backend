import { Tweet } from "../models/tweetModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    const user = req.user;
    const { content } = req.body;

    if (!content) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "Tweet must have content",
                success: false
            })
        );
    }

    const tweet = await Tweet.create({
        owner: user._id,
        content
    });

    return res.status(201).json(
        apiResponse({
            statusCode: 201,
            message: "Tweet created successfully!",
            data: { content: tweet.content }
        })
    );
});

const getUserTweet = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "User id not found or invalid id",
                success: false
            })
        );
    }
    const userTweet = await Tweet.find({
        owner: userId as unknown as mongoose.Schema.Types.ObjectId
    });

    if (userTweet.length == 0) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "User does not have any tweet.",
                success: false
            })
        );
    }

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Success!",
            data: userTweet
        })
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId as string)) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "Tweet id not found or invalid id",
                success: false
            })
        );
    }

    const tweet = await Tweet.findById(tweetId);
    const user = req.user;

    if (!tweet) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No tweet found with the given id",
                success: false
            })
        );
    }
    const isUserTheOwner = tweet.owner.toString() === user._id.toString();

    if (!isUserTheOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only owner can update this tweet.",
                success: false
            })
        );
    }

    const { content } = req.body;
    if (!content) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "No content provided!",
                success: false
            })
        );
    }

    tweet.content = content;
    await tweet.save();

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Tweet has been updated",
            data: tweet
        })
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId as string)) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "Tweet id not found or invalid id",
                success: false
            })
        );
    }

    const tweet = await Tweet.findById(tweetId);
    const user = req.user;

    if (!tweet) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No tweet found with the given id",
                success: false
            })
        );
    }
    const isUserTheOwner = tweet.owner.toString() === user._id.toString();

    if (!isUserTheOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only owner can update this tweet.",
                success: false
            })
        );
    }

    await tweet.deleteOne();

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Tweet delete successfully!"
        })
    );
});

export { createTweet, updateTweet, getUserTweet, deleteTweet };
