import axios from 'axios';

export const cancelRequest = (cancelTokenSource, reason) => {
    if (cancelTokenSource) {
        cancelTokenSource.cancel(reason || "Request manually cancelled.");
        return null;
    }
    return cancelTokenSource;
};

export const fetchModelName = async (chatId, signal) => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const response = await axios.get(
                `/api/chat/${chatId}/model`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: signal,
                }
            );

            if (response.data && response.data.modelName) {
                return response.data.modelName;
            }
        }
    } catch (error) {
        if (error.name === 'AbortError' || axios.isCancel(error)) {
            console.log("Model fetch aborted:", error.message);
            throw error;
        }
        console.error("Error fetching model from server:", error);
    }

    return "DeepSeek R1";
};

export const fetchMessages = async (chatId, signal) => {


    try {
        const token = localStorage.getItem("token");
        if (token) {
            const response = await axios.get(
                `/api/messages/${chatId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: signal,
                }
            );

            if (
                response.data.messages &&
                response.data.messages.length > 0
            ) {
                const serverMessages = response.data.messages.map(
                    (msg) => ({
                        content: msg.messageText,
                        role:
                            msg.messageType === "question"
                                ? "user"
                                : "assistant",
                    })
                );

                return serverMessages;
            }
        }
    } catch (error) {
        if (error.name === 'AbortError' || axios.isCancel(error)) {
            console.log("Message fetch aborted:", error.message);
            throw error;
        }
        console.error("Error fetching messages from server:", error);
    }

    return [];
};

export const saveMessage = async (messageText, messageType, chatId, currentModel) => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const currentMessageText = messageText;
            const currentMessageType = messageType;
            const currentChatId = chatId;

            await axios.post(
                "/api/messages",
                {
                    messageText: currentMessageText,
                    messageType: currentMessageType,
                    chatId: currentChatId,
                    modelName: currentModel
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        }
    } catch (error) {
        console.error("Error saving message:", error);
    }
};

export const fetchChats = async (signal) => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const response = await axios.get(
                "/api/chats",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: signal,
                }
            );

            if (response.data && response.data.chats) {
                return response.data.chats;
            }
        }
    } catch (error) {
        if (error.name === 'AbortError' || axios.isCancel(error)) {
            console.log("Chats fetch aborted:", error.message);
            throw error;
        }
        console.error("Error fetching chats from server:", error);
        throw error;
    }

    return [];
};

export const getAssistantResponse = async (userMessage, context, currentModel, options = {}) => {
    const currentUserMessage = userMessage;
    const currentContext = [...context];

    const {
        cancelTokenSource,
        onProgress,
        chatId
    } = options;

    let completeMessage = "";
    let error = null;

    try {
        const token = localStorage.getItem("token");

        await axios.post(
            "/api/chat",
            {
                message: currentUserMessage,
                model: currentModel,
                context: currentContext,
                chatId,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cancelToken: cancelTokenSource?.token,
                responseType: "text",
                onDownloadProgress: (progressEvent) => {
                    const newText = progressEvent.event?.target?.response;
                    if (newText) {
                        completeMessage = newText;
                        onProgress && onProgress(newText);
                    }
                },
            }
        );

        if (completeMessage) {
            await saveMessage(completeMessage, "response", chatId, currentModel);
        }

    } catch (err) {
        console.error("Error generating response:", err);

        if (axios.isCancel(err)) {
            console.log('Request canceled:', err.message);
            error = {
                message: err.message,
                isCancel: true
            };
        } else {
            error = {
                message: "There was an error when generating response.",
                isCancel: false
            };
        }
    }

    return {
        completeMessage,
        error
    };
};
