import axios from 'axios';

export const cancelRequest = (cancelTokenSource, reason) => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel(reason || "Request manually cancelled.");
    return null;
  }
  return cancelTokenSource;
};

export const fetchMessages = async (chatId) => {
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
    console.error("Error fetching messages from server:", error);
  }
  
  return [];
};

export const saveMessage = async (messageText, messageType, chatId) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await axios.post(
        "/api/messages",
        {
          messageText,
          messageType,
          chatId,
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
  const { 
    cancelTokenSource, 
    onProgress, 
    chatId 
  } = options;
  
  let completeMessage = "";
  let error = null;
  
  try {
    const token = localStorage.getItem("token");
    
    const response = await axios.post(
      "/api/chat",
      {
        message: userMessage,
        model: localStorage.getItem("selectedModel"),
        context: context,
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
    
    // Save the assistant's response
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
