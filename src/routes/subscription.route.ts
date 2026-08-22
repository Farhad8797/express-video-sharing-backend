import { Router } from "express";
import {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const subscriptionRouter = Router();

subscriptionRouter.post(
    "/subscription{:/channelId}",
    verifyJWT,
    toggleSubscription
);
subscriptionRouter.get(
    "/subscriptions{:/channelId}/subscribers",
    getUserChannelSubscribers
);
subscriptionRouter.get(
    "/subscriptions{:/subscriberId}/channels",
    getSubscribedChannels
);

export default subscriptionRouter;
