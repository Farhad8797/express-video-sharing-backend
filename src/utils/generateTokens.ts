import User from "../models/userModel.js";

export async function generateAccessAndRefreshToken(userId: string) {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (err: any) {
        return err;
    }
}
