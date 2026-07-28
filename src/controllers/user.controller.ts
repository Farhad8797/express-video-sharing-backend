import { asycncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import type { UserInterface } from "../models/userModel.js";
import User from "../models/userModel.js";
import { uploadFile } from "../utils/imagekit.js";
import { clearTemp } from "../utils/clearTemp.js";

const registerUser = asycncHandler(async (req, res) => {
    const { fullName, username, email, password }: UserInterface = req.body;
    if (
        [fullName, username, email, password].some(
            (element) => element?.trim() === ""
        )
    ) {
        return res.json(
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
        return res.json(
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
        return res.json(
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
        return res.json(
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
        return res.json(
            apiResponse({
                statusCode: 500,
                message: "Internal sever error",
                success: false
            })
        );
    }

    return res.json(
        apiResponse({
            statusCode: 201,
            message: "User Created Successfully",
            data: savedUserData
        })
    );
});

export { registerUser };
