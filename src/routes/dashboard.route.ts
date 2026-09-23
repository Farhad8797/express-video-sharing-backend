import { Router } from "express";
import { getChannelStats } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const dashboardRoute = Router();

dashboardRoute.get(
    "/channel/dashboard{/:channelId}",
    verifyJWT,
    getChannelStats
);

export default dashboardRoute;
