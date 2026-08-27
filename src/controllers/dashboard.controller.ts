import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Either channelId is missing or invalid userId",
                success: false
            })
        );
    }

    const isOwner = channelId === req.user._id.toString();
    if (!isOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only owner can view channel dashboard",
                success: false
            })
        );
    }

    const channelStats = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId as string)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            like_count: {
                                $size: "$likes"
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            duration: 1,
                            views: 1,
                            thumbnail: 1,
                            like_count: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "tweet",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            like_count: {
                                $size: "$likes"
                            }
                        }
                    },
                    {
                        $project: {
                            content: 1,
                            like_count: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                subscriber_count: {
                    $size: "$subscribers"
                },
                video_count: {
                    $size: "$videos"
                },
                tweet_count: {
                    $size: "$tweets"
                },
                total_views: {
                    $sum: "$videos.views"
                },
                total_likes_in_videos: {
                    $sum: "$videos.like_count"
                },
                total_likes_in_tweets: {
                    $sum: "$tweets.like_count"
                }
            }
        },
        {
            $project: {
                password: 0,
                refreshToken: 0,
                subscribers: 0
            }
        }
    ]);

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: channelStats.length ? "No channel found" : "Success!",
            data: channelStats.length ? channelStats[0] : []
        })
    );
});

export { getChannelStats };
