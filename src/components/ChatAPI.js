import axios from 'axios';

export const cancelRequest = (cancelTokenSource, reason) => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel(reason || "Request manually cancelled.");
    return null;
  }
  return cancelTokenSource;
};

export const fetchMessages = async (chatId, signal) => {
  const savedMessages = localStorage.getItem(`chat_${chatId}`);
  if (savedMessages) {
    return JSON.parse(savedMessages);
  }

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

        localStorage.setItem(
          `chat_${chatId}`,
          JSON.stringify(serverMessages)
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

export const saveMessage = async (messageText, messageType, chatId) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const currentMessageText = messageText;
      const currentMessageType = messageType;
      const currentChatId = chatId;
      const currentModel = localStorage.getItem("selectedModel");

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

export const getAssistantResponse = async (userMessage, context, options = {}) => {
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
    const currentModel = localStorage.getItem("selectedModel");

    console.log("DEBUG:", currentModel)

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
      await saveMessage(completeMessage, "response", chatId);
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
