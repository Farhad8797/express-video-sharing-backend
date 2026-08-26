import mongoose, { Schema } from "mongoose";

interface PlaylistInterface {
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    videos: Schema.Types.ObjectId[];
    owner: Schema.Types.ObjectId;
}

const PlaylistSchema = new Schema<PlaylistInterface>(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        videos: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Video"
                }
            ],
            validate: {
                validator: function (val: Schema.Types.ObjectId[]) {
                    return val.length <= 50;
                },
                message: "One playlist can contain maximum 50 videos."
            }
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

export const Playlist =
    (mongoose.models.Playlist as mongoose.Model<PlaylistInterface>) ||
    mongoose.model<PlaylistInterface>("Playlist", PlaylistSchema);
