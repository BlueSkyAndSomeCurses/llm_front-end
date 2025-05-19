import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,
    }, messageNum: {
        type: Number, default: 0,
    }, messageType: {
        type: String, default: "question",
    }, messageText: {
        type: String, required: true,
    }, chatId: {
        type: String, required: true,
    }, modelName: {
        type: String, default: "DeepSeek R1",
    }, timestamp: {
        type: Date, default: Date.now,
    },
});

messageSchema.pre("save", async function (next) {
    try {
        if (this.isNew) {
            const lastMessage = await this.constructor.findOne({
                userId: this.userId, chatId: this.chatId
            }, {}, {
                sort: {
                    messageNum: -1
                }
            });
            this.messageNum = lastMessage ? lastMessage.messageNum + 1 : 0;
        }
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model("Message", messageSchema);