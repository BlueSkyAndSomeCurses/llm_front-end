import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    messageNum: {
        type: Number,
        default: 0,
    },
    messageType: {
        type: String,
        default: "question",
    },
    messageText: {
        type: String,
        required: true,
    },
    chatId: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save middleware to handle auto-incrementing messageNum
messageSchema.pre("save", async function (next) {
    try {
        if (this.isNew) {
            // Find the message with the highest messageNum for this userId and chatId
            const lastMessage = await this.constructor.findOne(
                { userId: this.userId, chatId: this.chatId },
                {},
                { sort: { messageNum: -1 } }
            );

            // If a message was found, set messageNum to lastMessage.messageNum + 1
            // Otherwise, set it to 0 (first message)
            this.messageNum = lastMessage ? lastMessage.messageNum + 1 : 0;
        }
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model("Message", messageSchema);
