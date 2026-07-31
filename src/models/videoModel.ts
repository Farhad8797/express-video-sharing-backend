import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface VideoInterface {
    videoFile: string;
    thumbnail: string;
    owner: Schema.Types.ObjectId;
    title: string;
    description: string;
    duration: number;
    isPublished: boolean;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

const VideoSchema = new Schema<VideoInterface>(
    {
        videoFile: {
            type: String,
            required: true
        },

        thumbnail: {
            type: String,
            required: true
        },

        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        duration: {
            type: Number,
            required: true
        },

        views: {
            type: Number,
            default: 0
        },

        isPublished: {
            type: Boolean,
            required: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

VideoSchema.plugin(mongooseAggregatePaginate);

const Video =
    (mongoose.models.Video as mongoose.Model<VideoInterface>) ||
    mongoose.model<VideoInterface>("Video", VideoSchema);

export default Video;
