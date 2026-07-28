import mongoose, { Model, Schema } from "mongoose";
import * as bcrypt from "bcrypt-ts";
import jwt from "jsonwebtoken";

export interface UserInterface {
    username: string;
    email: string;
    fullName: string;
    avatar: string;
    coverImage: string;
    password: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
    watchHistory: Schema.Types.ObjectId[];
}

interface UserMethods {
    isPasswordCorrect(name: string): Promise<any>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const UserSchema = new Schema<
    UserInterface,
    Model<UserInterface, {}, UserMethods>,
    UserMethods
>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please provide a valid email"
            ]
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        avatar: {
            type: String,
            required: true
        },

        coverImage: {
            type: String
        },

        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        password: {
            type: String,
            required: [true, "Password is mandatory"],
            min: [6, "Password must contain at least 6 characters"]
        },

        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.method(
    "isPasswordCorrect",
    async function isPasswordCorrect(password: string) {
        return await bcrypt.compare(this.password, password);
    }
);

UserSchema.method("generateAccessToken", function generateAccessToken() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            fullName: this.fullName,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: "1d"
        }
    );
});

UserSchema.method("generateRefreshToken", function generateRefreshToken() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: "10d"
        }
    );
});

const User =
    (mongoose.models.User as mongoose.Model<UserInterface, {}, UserMethods>) ||
    mongoose.model<UserInterface, UserMethods>("User", UserSchema);

export default User;
