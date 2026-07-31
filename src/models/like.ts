import mongoose, { Schema } from "mongoose";

interface LikeInterface {
    createdAt: Date;
    updatedAt: Date;
    comment: Schema.Types.ObjectId;
    video: Schema.Types.ObjectId;
    tweet: Schema.Types.ObjectId;
    likedBy: Schema.Types.ObjectId;
}

const LikeSchema = new Schema<LikeInterface>(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },

        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },

        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },

        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

export const Like =
    (mongoose.models.Like as mongoose.Model<LikeInterface>) ||
    mongoose.model<LikeInterface>("Like", LikeSchema);
