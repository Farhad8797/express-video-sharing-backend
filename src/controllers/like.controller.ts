import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import Video from "../models/videoModel.js";
import { Like } from "../models/likeModel.js";
import { Tweet } from "../models/tweetModel.js";
import { Comment } from "../models/commentModel.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (videoId || !mongoose.Types.ObjectId.isValid(videoId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "video id is missing or invalid Id",
                success: false
            })
        );
    }

    const video = await Video.findById(videoId);

    if (!video) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No video found for this id",
                success: false
            })
        );
    }

    const user = req.user;
    const isVideoLikedByThisUser = await Like.findOne({
        $and: [
            { likedBy: user._id as unknown as mongoose.Schema.Types.ObjectId },
            { video: videoId as unknown as mongoose.Schema.Types.ObjectId }
        ]
    });

    if (!isVideoLikedByThisUser) {
        const like = await Like.create({
            likedBy: user._id,
            video: videoId as unknown as mongoose.Schema.Types.ObjectId
        });

        return res.status(200).json(
            apiResponse({
                statusCode: 200,
                message: "Like added",
                data: like
            })
        );
    } else {
        await isVideoLikedByThisUser?.deleteOne();
        return res
            .status(200)
            .json(apiResponse({ statusCode: 200, message: "Like removed!" }));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (tweetId || !mongoose.Types.ObjectId.isValid(tweetId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "tweet id is missing or invalid Id",
                success: false
            })
        );
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No tweet found for this id",
                success: false
            })
        );
    }

    const user = req.user;
    const isTweetLikedByThisUser = await Like.findOne({
        $and: [
            { likedBy: user._id as unknown as mongoose.Schema.Types.ObjectId },
            { tweet: tweetId as unknown as mongoose.Schema.Types.ObjectId }
        ]
    });

    if (!isTweetLikedByThisUser) {
        const like = await Like.create({
            likedBy: user._id,
            tweet: tweetId as unknown as mongoose.Schema.Types.ObjectId
        });

        return res.status(200).json(
            apiResponse({
                statusCode: 200,
                message: "Like added",
                data: like
            })
        );
    } else {
        await isTweetLikedByThisUser?.deleteOne();
        return res
            .status(200)
            .json(apiResponse({ statusCode: 200, message: "Like removed!" }));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (commentId || !mongoose.Types.ObjectId.isValid(commentId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "comment id is missing or invalid Id",
                success: false
            })
        );
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No comment found for this id",
                success: false
            })
        );
    }

    const user = req.user;
    const isCommentLikedByThisUser = await Like.findOne({
        $and: [
            { likedBy: user._id as unknown as mongoose.Schema.Types.ObjectId },
            { comment: commentId as unknown as mongoose.Schema.Types.ObjectId }
        ]
    });

    if (!isCommentLikedByThisUser) {
        const like = await Like.create({
            likedBy: user._id,
            comment: commentId as unknown as mongoose.Schema.Types.ObjectId
        });

        return res.status(200).json(
            apiResponse({
                statusCode: 200,
                message: "Like added",
                data: like
            })
        );
    } else {
        await isCommentLikedByThisUser?.deleteOne();
        return res
            .status(200)
            .json(apiResponse({ statusCode: 200, message: "Like removed!" }));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "user id is missing or invalid Id",
                success: false
            })
        );
    }

    const isUserTheOwner = req.user?._id.toString() === userId?.toString();

    if (!isUserTheOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only owner can see his/her liked videos",
                success: false
            })
        );
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user?._id,
                video: { $exists: true }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            duration: 1,
                            views: 1,
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "video.owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video.owner"
        }
    ]);

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: `Liked videos: ${likedVideos.length}`,
            data: likedVideos
        })
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
