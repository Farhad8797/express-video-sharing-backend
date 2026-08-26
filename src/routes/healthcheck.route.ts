import { Router } from "express";
import healthcheck from "../controllers/healthcheck.controller.js";

const healthcheckRouter = Router();

healthcheckRouter.get("/healthcheck", healthcheck);

export default healthcheckRouter;
