import { UserInterface, UserMethods } from "../models/user.model.js";
import { HydratedDocument } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            // 🟢 Adds the user property to Express Request globally
            user?: HydratedDocument<UserInterface, UserMethods>;
        }
    }
}
