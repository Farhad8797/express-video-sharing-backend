import mongoose, { Schema } from "mongoose";

interface TweetInterface {
    owner: Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const TweetSchema = new Schema<TweetInterface>(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        content: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export const Tweet =
    (mongoose.models.Tweet as mongoose.Model<TweetInterface>) ||
    mongoose.model<TweetInterface>("Tweet", TweetSchema);
