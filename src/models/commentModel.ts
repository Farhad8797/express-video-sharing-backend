import mongoose, { Schema, type AggregatePaginateModel } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface CommentInterface {
    content: string;
    createdAt: Date;
    updatedAt: Date;
    video: Schema.Types.ObjectId;
    owner: Schema.Types.ObjectId;
    tweet: Schema.Types.ObjectId;
}

const CommentSchema = new Schema<CommentInterface>(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        }
    },
    { timestamps: true }
);

CommentSchema.plugin(mongooseAggregatePaginate);

type CommentModel = mongoose.Model<CommentInterface> &
    mongoose.AggregatePaginateModel<CommentInterface>;

export const Comment =
    (mongoose.models.Comment as CommentModel) ||
    mongoose.model<CommentInterface, CommentModel>("Comment", CommentSchema);
