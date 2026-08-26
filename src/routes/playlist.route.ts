import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylist,
    addvideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const playlistRouter = Router();

playlistRouter.post("/create/playlist", verifyJWT, createPlaylist);
playlistRouter.get("/u/playlist{:/userId}", getUserPlaylist);
playlistRouter.post(
    "/add-video/playlist{:/playlistId}{:/videoId}",
    verifyJWT,
    addvideoToPlaylist
);
playlistRouter.post(
    "/remove-video/playlist{:/playlistId}{:/videoId}",
    verifyJWT,
    removeVideoFromPlaylist
);
playlistRouter.get("/playlist{:/playlistId}", verifyJWT, getPlaylistById);
playlistRouter.patch(
    "/update/playlist{:/playlistId}",
    verifyJWT,
    updatePlaylist
);
playlistRouter.delete(
    "/delete/playlist{:/playlistId}",
    verifyJWT,
    deletePlaylist
);

export default playlistRouter;
