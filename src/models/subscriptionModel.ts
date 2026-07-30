import mongoose, { Schema } from "mongoose";

interface SubscriptionInterface {
    subscriber: Schema.Types.ObjectId;
    channel: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<SubscriptionInterface>(
    {
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

export const SubscriptionModel =
    (mongoose.models
        .SubscriptionModel as mongoose.Model<SubscriptionInterface>) ||
    mongoose.model<SubscriptionInterface>(
        "SubsscriptionModel",
        SubscriptionSchema
    );
