import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { Subscription } from "../models/subscriptionModel.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "channel id is missing or invalid Id",
                success: false
            })
        );
    }

    const user = req.user;
    const isUserSubscribed = await Subscription.findOne({
        $and: [
            {
                subscriber:
                    user._id as unknown as mongoose.Schema.Types.ObjectId
            },
            { channel: channelId as unknown as mongoose.Schema.Types.ObjectId }
        ]
    });

    if (!isUserSubscribed) {
        const subscription = await Subscription.create({
            subscriber: user._id,
            channel: channelId as unknown as mongoose.Schema.Types.ObjectId
        });

        return res.status(201).json(
            apiResponse({
                statusCode: 201,
                message: "Subscribed!",
                data: subscription
            })
        );
    } else {
        await isUserSubscribed.deleteOne();

        return res.status(201).json(
            apiResponse({
                statusCode: 201,
                message: "Unsubscribed!"
            })
        );
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "channel id is missing or invalid Id",
                success: false
            })
        );
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId as string)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatarFile: 1,
                            fullName: 1,
                            _id: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project: {
                _id: "$subscriber._id",
                username: "$subscriber.username",
                fullName: "$subscriber.fullName",
                avatar: "$subscriber.avatarFile",
                subscribedAt: "$createdAt"
            }
        }
    ]);

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: subscribers.length
                ? `Channel has ${subscribers.length} subscribers`
                : "Either channel does not exist or channel has 0 subscriber",
            data: subscribers.length ? subscribers : []
        })
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (
        !subscriberId ||
        !mongoose.Types.ObjectId.isValid(subscriberId as string)
    ) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "channel id is missing or invalid Id",
                success: false
            })
        );
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId as string)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatarFile: 1,
                            fullName: 1,
                            _id: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project: {
                _id: "$channel._id",
                username: "$channel.username",
                fullName: "$channel.fullName",
                avatar: "$channel.avatarFile",
                subscribedAt: "$createdAt"
            }
        }
    ]);

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: channels.length
                ? `User has subscribed to ${channels.length} channels`
                : "Either user does not exist or user has not subscribed to any channel",
            data: channels.length ? channels : []
        })
    );
});

export { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers };
