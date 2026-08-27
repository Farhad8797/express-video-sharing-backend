import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlistModel.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import Video from "../models/videoModel.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Either name or description is missing.",
                success: false
            })
        );
    }

    const user = req.user;

    const playlist = await Playlist.create({
        name,
        description,
        owner: user._id
    });

    return res.status(201).json(
        apiResponse({
            statusCode: 201,
            message: "Playlist created!",
            data: playlist
        })
    );
});

const getUserPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Either userId is missing or invalid userId",
                success: false
            })
        );
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId as string)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatarFile: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            views: 1,
                            owner: 1,
                            thumbnail: 1,
                            videoFile: 1,
                            duration: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video_count: {
                    $size: "$videos"
                }
            }
        }
    ]);

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: playlists.length ? "Success!" : "Playlist has 0 videos",
            data: playlists.length ? playlists : []
        })
    );
});

const addvideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (
        !playlistId ||
        !mongoose.Types.ObjectId.isValid(playlistId as string) ||
        !videoId ||
        !mongoose.Types.ObjectId.isValid(videoId as string)
    ) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Invalid playlistId or videoId",
                success: false
            })
        );
    }

    const playlist = await Playlist.findById(playlistId as string);
    const video = await Video.findById(videoId as string);

    if (!playlist || !video) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No playlist or video found with this id",
                success: false
            })
        );
    }

    const isUserTheOwner =
        playlist.owner.toString() === req.user._id.toString();

    if (!isUserTheOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only creator of the playlist can modify it.",
                success: false
            })
        );
    }

    playlist.videos.push(
        video._id as unknown as mongoose.Schema.Types.ObjectId
    );
    await playlist.save();

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Video has been added to playlist!",
            data: playlist
        })
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (
        !playlistId ||
        !mongoose.Types.ObjectId.isValid(playlistId as string) ||
        !videoId ||
        !mongoose.Types.ObjectId.isValid(videoId as string)
    ) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Invalid playlistId or videoId",
                success: false
            })
        );
    }

    const playlist = await Playlist.findById(playlistId as string);
    const video = playlist?.videos
        .map((video) => video.toString())
        .includes(videoId as string);

    if (!playlist || !video) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No playlist or video found with this id",
                success: false
            })
        );
    }

    const isUserTheOwner =
        playlist.owner.toString() === req.user._id.toString();

    if (!isUserTheOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only creator of the playlist can modify it.",
                success: false
            })
        );
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    );

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Video removed from playlist!",
            data: updatedPlaylist ? updatedPlaylist : []
        })
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Either playlistId is missing or invalid userId",
                success: false
            })
        );
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId as string)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatarFile: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            views: 1,
                            owner: 1,
                            thumbnail: 1,
                            videoFile: 1,
                            duration: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video_count: {
                    $size: "$videos"
                }
            }
        }
    ]);

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: playlist.length
                ? "Success!"
                : "Playlist not found with this id",
            data: playlist.length ? playlist : []
        })
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Either playlistId is missing or invalid userId",
                success: false
            })
        );
    }

    const playlist = await Playlist.findById(playlistId as string);
    if (!playlist) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No playlist found with this id",
                success: false
            })
        );
    }

    const isUserTheOwner =
        playlist.owner.toString() === req.user._id.toString();

    if (!isUserTheOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only creator of the playlist can modify it.",
                success: false
            })
        );
    }

    const { name, description } = req.body;

    playlist.name = name ? name : playlist.name;
    playlist.description = description ? description : playlist.description;
    await playlist.save();

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Playlist updated successfully!",
            data: playlist
        })
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId as string)) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Either playlistId is missing or invalid userId",
                success: false
            })
        );
    }

    const playlist = await Playlist.findById(playlistId as string);
    if (!playlist) {
        return res.status(404).json(
            apiResponse({
                statusCode: 404,
                message: "No playlist found with this id",
                success: false
            })
        );
    }

    const isUserTheOwner =
        playlist.owner.toString() === req.user._id.toString();

    if (!isUserTheOwner) {
        return res.status(403).json(
            apiResponse({
                statusCode: 403,
                message: "Only creator of the playlist can delete it.",
                success: false
            })
        );
    }

    await playlist.deleteOne();
    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Playlist deleted successfully!"
        })
    );
});

export {
    createPlaylist,
    getUserPlaylist,
    addvideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist
};
