import mongoose, { mongoosePopulatedDocumentMarker, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface Video {
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

const VideoSchema = new Schema<Video>(
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
            required: true
        }
    },
    { timestamps: true }
);

VideoSchema.plugin(mongooseAggregatePaginate);
