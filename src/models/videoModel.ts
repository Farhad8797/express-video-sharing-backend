import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface VideoInterface {
    videoFile: {
        videoUrl: string;
        videoId: string;
    };
    thumbnail: {
        thumbnailUrl: string;
        thumbnailId: string;
    };
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
            videoUrl: {
                type: String,
                required: true
            },
            videoId: {
                type: String,
                required: true
            }
        },

        thumbnail: {
            thumbnailUrl: {
                type: String,
                required: true
            },
            thumbnailId: {
                type: String,
                required: true
            }
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
            required: true,
            default: false
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
