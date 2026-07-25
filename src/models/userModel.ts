import mongoose, { Schema } from "mongoose";
import * as bcrypt from "bcrypt-ts";
import jwt from "jsonwebtoken";

interface User {
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

const UserSchema = new Schema<User>(
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
    { timestamps: true }
);

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(this.password, password);
};

UserSchema.methods.generateAccesToken = function () {
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
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: "10d"
        }
    );
};

const User =
    (mongoose.models.User as mongoose.Model<User>) ||
    mongoose.model("User", UserSchema);

export default User;
