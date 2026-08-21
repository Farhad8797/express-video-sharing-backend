import mongoose from "mongoose";
import { Comment } from "../models/commentModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import Video from "../models/videoModel.js";
import { Tweet } from "../models/tweetModel.js";

const getVideoComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const page = Math.max(parseInt(req.query?.page as string, 10) || 1, 1);
    const commentPerPage = Math.max(
        parseInt(req.query?.page as string, 10) || 10,
        10
    );

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId as string)) {
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

    const commentQuery = await Comment.aggregate([
        {
            $match: {
                video: videoId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "commentators",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            email: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$commentators"
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    const options = {
        page,
        limit: commentPerPage,
        customLevels: {
            docs: "comments",
            totalDocs: "totalComments"
        }
    };

    const result = await Comment.aggregatePaginate(commentQuery, options);

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: (result.comments as []).length
                ? "Comments retrieved successfully!"
                : "Video has no comments",
            data: result
        })
    );
});

const getTweetComment = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const page = Math.max(parseInt(req.query?.page as string, 10) || 1, 1);
    const commentPerPage = Math.max(
        parseInt(req.query?.page as string, 10) || 10,
        10
    );

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Tweet id is missing or invalid Id",
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

    const commentQuery = await Comment.aggregate([
        {
            $match: {
                tweet: tweetId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "commentators",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$commentators"
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    const options = {
        page,
        limit: commentPerPage,
        customLevels: {
            docs: "comments",
            totalDocs: "totalComments"
        }
    };

    const result = await Comment.aggregatePaginate(commentQuery, options);

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: (result.comments as []).length
                ? "Comments retrieved successfully!"
                : "Video has no comments",
            data: result
        })
    );
});

const addCommentToVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId as string)) {
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

    const { content } = req.body;
    const comment = await Comment.create({
        content,
        video: videoId as unknown as mongoose.Schema.Types.ObjectId,
        owner: user._id
    });

    return res.status(201).json({
        statusCode: 201,
        message: "Comment added successfully!",
        data: comment
    });
});

const addCommentToTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const user = req.user;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId as string)) {
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

    const { content } = req.body;
    const comment = await Comment.create({
        content,
        tweet: tweetId as unknown as mongoose.Schema.Types.ObjectId,
        owner: user._id
    });

    return res.status(201).json({
        statusCode: 201,
        message: "Comment added successfully!",
        data: comment
    });
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Comment id is missing or invalid Id",
                success: false
            })
        );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No comment found with the given id",
                success: false
            })
        );
    }
    const { content } = req.body;
    const isUserTheOwner = comment.owner.toString() === user._id.toString();

    if (!isUserTheOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only owner can update this comment.",
                success: false
            })
        );
    }

    comment.content = content;
    await comment.save();

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Comment has been updated successfully!",
            data: comment
        })
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Comment id is missing or invalid Id",
                success: false
            })
        );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No comment found with the given id",
                success: false
            })
        );
    }

    const isUserTheOwner = comment.owner.toString() === user._id.toString();

    if (!isUserTheOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only owner can delete this comment.",
                success: false
            })
        );
    }

    await comment.deleteOne();

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Only owner can delete this comment."
        })
    );
});

export {
    getVideoComment,
    getTweetComment,
    addCommentToTweet,
    addCommentToVideo,
    updateComment,
    deleteComment
};
