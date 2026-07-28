import { asycncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import type { UserInterface } from "../models/userModel.js";
import User from "../models/userModel.js";
import { uploadFile } from "../utils/imagekit.js";
import { clearTemp } from "../utils/clearTemp.js";
import { generateAccessAndRefreshToken } from "../utils/generateTokens.js";

const registerUser = asycncHandler(async (req, res) => {
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
        $or: [{ username, email }]
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

const signInUser = asycncHandler(async (req, res) => {
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
        $or: [{ email, password }]
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
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .json(
            apiResponse({
                statusCode: 200,
                message: "user logged in successfully",
                data: { loggedInUser, refreshToken },
                success: true
            })
        );
});

const signOutUser = asycncHandler(async (req, res) => {
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
        .json(
            apiResponse({
                statusCode: 200,
                message: "Successfully logged out user"
            })
        );
});

export { registerUser, signInUser, signOutUser };
