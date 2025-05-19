import {useState, useEffect, useRef, useCallback} from "react";
import {useLocation} from "react-router-dom";
import axios from "axios";
import {
    fetchMessages, fetchModelName, saveMessage, getAssistantResponse, cancelRequest
} from "../utils/chatAPI.js";

export default function useChatMessages(chatId) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState("");

    const hasRespondedRef = useRef(false);
    const messagesRef = useRef(messages);
    const cancelTokenSourceRef = useRef(null);
    const location = useLocation();
    const prevLocationRef = useRef(location);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        if (prevLocationRef.current.pathname !== location.pathname) {
            cancelTokenSourceRef.current = cancelRequest(cancelTokenSourceRef.current, "Request cancelled: You navigated away from the page.");
        }
        prevLocationRef.current = location;
    }, [location]);

    useEffect(() => {
        return () => {
            cancelTokenSourceRef.current = cancelRequest(cancelTokenSourceRef.current, "Request cancelled: Component unmounted.");
        };
    }, []);

    const handleCancel = () => {
        cancelTokenSourceRef.current = cancelRequest(cancelTokenSourceRef.current);

        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastIndex = updatedMessages.length - 1;

            if (lastIndex >= 0 && updatedMessages[lastIndex].role === "assistant") {
                updatedMessages[lastIndex] = {
                    ...updatedMessages[lastIndex],
                    content: "There was an error when generating response: Request was cancelled."
                };
            }
            return updatedMessages;
        });

        setIsLoading(false);
    };

    const initializeAssistantMessage = () => {
        setMessages((prev) => [...prev, {
            content: `Thinking...`, role: "assistant"
        },]);
    };

    const updateAssistantMessage = useCallback((newText) => {
        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastIndex = updatedMessages.length - 1;

            if (lastIndex >= 0 && updatedMessages[lastIndex].role === "assistant") {
                updatedMessages[lastIndex] = {
                    ...updatedMessages[lastIndex], content: newText
                };
            }

            return updatedMessages;
        });
    }, []);

    const handleResponseError = useCallback((error) => {
        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastIndex = updatedMessages.length - 1;

            if (lastIndex >= 0 && updatedMessages[lastIndex].role === "assistant") {
                updatedMessages[lastIndex] = {
                    ...updatedMessages[lastIndex],
                    content: error.isCancel ? `There was an error when generating response: ${error.message}` : "There was an error when generating response."
                };
            }
            return updatedMessages;
        });
    }, []);

    const handleAssistantResponse = useCallback(async (userMessage) => {
        cancelTokenSourceRef.current = cancelRequest(cancelTokenSourceRef.current);
        setIsLoading(true);

        initializeAssistantMessage();

        cancelTokenSourceRef.current = axios.CancelToken.source();

        const {
            completeMessage,
            error
        } = await getAssistantResponse(userMessage, messagesRef.current.slice(0, -1), selectedModel, {
            cancelTokenSource: cancelTokenSourceRef.current, chatId, onProgress: updateAssistantMessage
        });

        if (error) {
            handleResponseError(error);
        }

        setIsLoading(false);
        cancelTokenSourceRef.current = null;
    }, [chatId, selectedModel, updateAssistantMessage, handleResponseError]);

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();

        const loadMessages = async () => {
            try {
                const modelName = await fetchModelName(chatId, abortController.signal);
                setSelectedModel(modelName);

                const fetchedMessages = await fetchMessages(chatId, abortController.signal);

                if (isMounted) {
                    setMessages(fetchedMessages);

                    if (fetchedMessages.length === 1 && fetchedMessages[0].role === "user" && !hasRespondedRef.current) {
                        hasRespondedRef.current = true;

                        setTimeout(() => {
                            if (isMounted) {
                                handleAssistantResponse(fetchedMessages[0].content);
                            }
                        }, 500);
                    }
                }
            } catch (error) {
                if (error.name !== 'AbortError' && isMounted) {
                    console.error("Error loading messages:", error);
                }
            }
        };

        loadMessages();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [chatId, handleAssistantResponse]);

    const submitMessage = async (inputValue) => {
        if (inputValue.trim() === "") return;

        const userMessage = {
            content: inputValue, role: "user",
        };

        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, userMessage];
            return updatedMessages;
        });

        await saveMessage(inputValue, "question", chatId, selectedModel);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await handleAssistantResponse(inputValue);
    };

    return {
        messages, isLoading, submitMessage, handleCancel
    };
}
