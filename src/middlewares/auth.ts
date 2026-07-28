import User from "../models/userModel.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asycncHandler } from "../utils/asyncHandler.js";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
    _id: string;
    email: string;
    username: string;
    fullName: string;
}

export const verifyJWT = asycncHandler(async (req, res, next) => {
    const accessToken =
        req.cookies?.accessToken ||
        req.header("Authorization")?.split(" ")[1] ||
        req.header("Authorization")?.replace(/^Bearer\s+/i, "");

    if (!accessToken) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "No token found",
                success: false
            })
        );
    }

    const isValidToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string
    );
    if (!isValidToken) {
        return res.status(401).json(
            apiResponse({
                statusCode: 401,
                message: "Invalid token",
                success: false
            })
        );
    }

    const decodedToken = jwt.decode(isValidToken as string) as CustomJwtPayload;
    const user = await User.findById(decodedToken?._id);

    if (!user) {
        return res.status(401).json(
            apiResponse({
                statusCode: 401,
                message: "Unauthorized",
                success: false
            })
        );
    }

    req.user = user;
    next();
});
