import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface CommentInterface {
    content: string;
    createdAt: Date;
    updatedAt: Date;
    video: Schema.Types.ObjectId;
    owner: Schema.Types.ObjectId;
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
        }
    },
    { timestamps: true }
);

CommentSchema.plugin(mongooseAggregatePaginate);

export const Comment =
    (mongoose.models.Comment as mongoose.Model<CommentInterface>) ||
    mongoose.model<CommentInterface>("Comment", CommentSchema);
