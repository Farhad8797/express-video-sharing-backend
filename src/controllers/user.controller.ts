import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import type { UserInterface } from "../models/userModel.js";
import User from "../models/userModel.js";
import { uploadFile } from "../utils/imagekit.js";
import { clearTemp } from "../utils/clearTemp.js";
import { generateAccessAndRefreshToken } from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
import { type CustomJwtPayload } from "../middlewares/auth.js";

const options: object = {
    httpOnly: true,
    secure: false,
    path: "/"
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password }: UserInterface = req.body;
    if (
        [fullName, username, email, password].some(
            (element) => element?.trim() === ""
        )
    ) {
        clearTemp();
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Credentials not provided",
                success: false
            })
        );
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        clearTemp();
        return res.status(409).json(
            apiResponse({
                statusCode: 409,
                message: "User already exists",
                success: false
            })
        );
    }
    const files =
        req.files && !Array.isArray(req.files) ? req.files : undefined;
    const avatarLocalPath = files?.avatar?.[0]?.path;
    const coverImageLocalPath = files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        clearTemp();
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Avatar not provided",
                success: false
            })
        );
    }

    const avatar = await uploadFile(avatarLocalPath as string, "avatar");
    const coverImage = await uploadFile(
        coverImageLocalPath as string,
        "coverImage"
    );

    if (!avatar) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Avatar not uploaded to Imagekit",
                success: false
            })
        );
    }

    const user = await User.create({
        username,
        email,
        fullName,
        password,
        avatar: avatar.url as string,
        coverImage: coverImage?.url || ""
    });

    const savedUserData = await User.findById(user._id).select(
        "-password -watch_history"
    );

    if (!savedUserData) {
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
            message: "User Created Successfully",
            data: savedUserData
        })
    );
});

const signInUser = asyncHandler(async (req, res) => {
    const { email, username, password }: UserInterface = req.body;
    if (!email && !username) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Email or username must be provided",
                success: false
            })
        );
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "User is not registered",
                success: false
            })
        );
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        return res.status(401).json(
            apiResponse({
                statusCode: 401,
                message: "Incorrect password",
                success: false
            })
        );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id.toString()
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            apiResponse({
                statusCode: 200,
                message: "user logged in successfully",
                data: { loggedInUser, refreshToken }
            })
        );
});

const signOutUser = asyncHandler(async (req, res) => {
    const user = req.user;
    await User.findByIdAndUpdate(
        user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true,
            runValidators: true
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", {
            httpOnly: true,
            secure: false,
            path: "/"
        })
        .clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            path: "/"
        })
        .json(
            apiResponse({
                statusCode: 200,
                message: "Successfully logged out user"
            })
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const servedRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    if (!servedRefreshToken) {
        res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Please provide refresh token",
                success: false
            })
        );
    }

    try {
        const isValidToken = jwt.verify(
            servedRefreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as CustomJwtPayload;

        if (!isValidToken) {
            return res.status(401).json(
                apiResponse({
                    statusCode: 401,
                    message: "Invalid token",
                    success: false
                })
            );
        }

        const user = await User.findById(isValidToken?._id).select("-password");

        if (!user) {
            return res.status(401).json(
                apiResponse({
                    statusCode: 401,
                    message: "Unauthorized",
                    success: false
                })
            );
        }

        if (!user.refreshToken) {
            return res.status(400).json(
                apiResponse({
                    statusCode: 400,
                    message:
                        "User does n;t contain any refresh token inside database",
                    success: false
                })
            );
        }

        const matchRefereshTokens = user.refreshToken === servedRefreshToken;

        if (!matchRefereshTokens) {
            return res.status(401).json(
                apiResponse({
                    statusCode: 400,
                    message:
                        "Refresh tokens does not match with the stored token",
                    success: false
                })
            );
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id.toString());

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                apiResponse({
                    statusCode: 200,
                    message: "user logged in successfully",
                    data: { user }
                })
            );
    } catch (error) {
        return res.status(500).json(
            apiResponse({
                statusCode: 500,
                message: "Internal server error",
                success: false
            })
        );
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Both old and new passwords are required",
                success: false
            })
        );
    }

    const user = await User.findById(req.user?._id).select("+password");
    const isPasswordCorrect = await user!.isPasswordCorrect(newPassword);
    if (!isPasswordCorrect) {
        return res.status(401).json(
            apiResponse({
                statusCode: 401,
                message: "Old password are is incorrect",
                success: false
            })
        );
    }
    user!.password = newPassword;
    await user!.save({ validateBeforeSave: false });

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Password have been changed successfully"
        })
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            data: req.user,
            message: "User fetched successfully"
        })
    );
});

const updateUserAccountInfo = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body;

    if (!email || !fullName) {
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Both fields are required",
                success: false
            })
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                email,
                fullName
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    return res.status(200).json(
        apiResponse({
            statusCode: 400,
            message: "Account details have been updated!"
        })
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath: string | undefined = req.file?.path;

    if (!avatarLocalPath) {
        clearTemp();
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "avatar path must be provided",
                success: false
            })
        );
    }

    const newAvatar = await uploadFile(avatarLocalPath as string, "avatar");
    if (!newAvatar?.url) {
        clearTemp();
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Avatar not uploaded to Imagekit",
                success: false
            })
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: newAvatar?.url }
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Avatar has been updated",
            data: { ...user }
        })
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath: string | undefined = req.file?.path;

    if (!coverImageLocalPath) {
        clearTemp();
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Cover Image path must be provided",
                success: false
            })
        );
    }

    const newCoverImager = await uploadFile(
        coverImageLocalPath as string,
        "coverImage"
    );
    if (!newCoverImager?.url) {
        clearTemp();
        return res.status(400).json(
            apiResponse({
                statusCode: 400,
                message: "Cover Image not uploaded to Imagekit",
                success: false
            })
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { coverImage: newCoverImager?.url }
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    return res.status(200).json(
        apiResponse({
            statusCode: 200,
            message: "Cover Image has been updated",
            data: { ...user }
        })
    );
});

export {
    registerUser,
    signInUser,
    signOutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserAccountInfo,
    updateAvatar,
    updateCoverImage
};
