import { Router } from "express";
import { registerUser } from "../controllers/registerUser.js";
const router = Router();

router.get("/welcome", registerUser);

export default router;
