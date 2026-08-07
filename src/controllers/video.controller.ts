import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/videoModel.js";
import { type VideoInterface } from "../models/videoModel.js";
import { uploadFile } from "../utils/imagekit.js";
import { apiResponse } from "../utils/apiResponse.js";
import { clearTemp } from "../utils/clearTemp.js";
import mongoose from "mongoose";
import { redis } from "../config/redis.config.js";
import { client } from "../utils/imagekit.js";

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description }: VideoInterface = req.body;
    if (
        !title ||
        !description ||
        [title, description].some((element) => element?.trim() === "")
    ) {
        clearTemp();
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Video must have a title and a description",
                success: false
            })
        );
    }

    const files =
        req?.files && !Array.isArray(req?.files) ? req.files : undefined;
    const videoFileLocalPath = files?.video?.[0]?.path;
    const thumbnailLocalPath = files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath || !thumbnailLocalPath) {
        clearTemp();
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Video path and thumbnail is required",
                success: false
            })
        );
    }

    const video = await uploadFile(videoFileLocalPath as string, "video");
    const thumbnail = await uploadFile(
        thumbnailLocalPath as string,
        "thumbnail"
    );

    if (!video || !thumbnail) {
        clearTemp();
        return res.status(500).json(
            apiResponse({
                statusCode: 500,
                message: "Couldn't upload video or thumbnail in Imagekit",
                success: false
            })
        );
    }

    const owner = req.user;
    const uploadedVideo = await Video.create({
        title,
        description,
        thumbnail: {
            thumbnailUrl: thumbnail?.url as string,
            thumbnailId: thumbnail?.fileId as string
        },
        videoFile: {
            videoUrl: video?.url as string,
            videoId: video?.fileId as string
        },
        duration: video?.duration as number,
        owner: owner?._id
    });

    const newVideo = await Video.findById(uploadedVideo._id);

    if (!newVideo) {
        return res.status(500).json(
            apiResponse({
                statusCode: 500,
                message: "Internal sever error",
                success: false
            })
        );
    }

    return res.status(201).json(
        apiResponse({
            statusCode: 201,
            message: "Video uploaded successfully"
        })
    );
});

const findOneVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Video Id is required",
                success: false
            })
        );
    }

    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Video not found",
                success: false
            })
        );
    }

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Success!",
            data: video
        })
    );
});

const findAllVidoes = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Channel id/User id is required as params",
                success: false
            })
        );
    }

    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
        return res.status(400).json({ message: "Invalid User ID format" });
    }

    const videos = await Video.find({
        owner: userId as unknown as mongoose.Schema.Types.ObjectId
    });

    if (videos.length === 0) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "This channel has no video",
                success: false
            })
        );
    }

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Success!",
            data: videos
        })
    );
});

const updateVideoStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId as string) || !videoId) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Video Id is invalid or missing",
                success: false
            })
        );
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: { isPublished: { $not: "$isPublished" } }
        },
        { new: true }
    );
    if (!video) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "Video with the given id doesn't exist",
                success: false
            })
        );
    }

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Video has been published!",
            data: video
        })
    );
});

const increaseViewCount = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId as string) || !videoId) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Video Id is invalid or missing",
                success: false
            })
        );
    }

    const identifier = req.user?._id?.toString() || req.ip;
    const redisKeyForViewer = `${videoId}+${identifier}`;
    const hasViewed = await redis.get(redisKeyForViewer);
    if (hasViewed) {
        return res.status(200).json(
            apiResponse({
                statusCode: 200,
                message: "Video has been viewed already",
                success: true
            })
        );
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: { views: { $inc: 1 } }
        },
        { new: true }
    );

    if (!video) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "Video not found!",
                success: false
            })
        );
    }
    await redis.set(redisKeyForViewer, "1", "EX", 3600, "NX");

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "View has been increased",
            data: video
        })
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Video Id is invalid or missing",
                success: false
            })
        );
    }

    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "Video not found!",
                success: false
            })
        );
    }

    try {
        await client.files.bulk.delete({
            fileIds: [video.videoFile?.videoId, video.thumbnail?.thumbnailId]
        });
    } catch (err) {
        console.error(
            "Files have been deleted from database but not from media storage!"
        );
    }

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Video has been deleted successfully!",
            data: { deletedVideoId: video?._id }
        })
    );
});

const deleteAllVideos = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Channel id/User id is required as params",
                success: false
            })
        );
    }

    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
        return res.status(400).json({ message: "Invalid User ID format" });
    }

    const videos = await Video.find({
        owner: userId as unknown as mongoose.Schema.Types.ObjectId
    });

    if (videos.length === 0) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "This channel has no videos to delete",
                success: false
            })
        );
    }

    const deletedVideoQuery = await Video.deleteMany({
        owner: userId as unknown as mongoose.Schema.Types.ObjectId
    });
    if (!deletedVideoQuery.acknowledged) {
        return res.status(500).json(
            apiResponse({
                statusCode: 500,
                message: "Couldn't delete media files from root database",
                success: false
            })
        );
    }

    const fileIdsToBeDeleted: string[] = [];
    videos.forEach((video) => {
        if (video.videoFile.videoId) {
            fileIdsToBeDeleted.push(video.videoFile.videoId);
        }
        if (video.thumbnail.thumbnailId) {
            fileIdsToBeDeleted.push(video.thumbnail.thumbnailId);
        }
    });

    try {
        const chunckSize = 100;
        for (let i = 0; i < fileIdsToBeDeleted.length; i += chunckSize) {
            let chunck = fileIdsToBeDeleted.slice(i, i + chunckSize);
            await client.files.bulk.delete({ fileIds: chunck });
        }
    } catch (err) {
        return res.status(500).json(
            apiResponse({
                statusCode: 500,
                message: "Couldn't delete media files from storage",
                success: false
            })
        );
    }

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message:
                "All videos of this channel have been deleted successfully!",
            data: deletedVideoQuery
        })
    );
});

export {
    publishVideo,
    findAllVidoes,
    findOneVideo,
    updateVideoStatus,
    increaseViewCount,
    deleteVideo,
    deleteAllVideos
};
