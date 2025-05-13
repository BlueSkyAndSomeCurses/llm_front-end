import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/activechat.scss";
import "../styles/sidebar.scss";
import Sidebar from "./sidebar";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { fetchMessages, saveMessage, getAssistantResponse, cancelRequest } from "./ChatAPI";

function ActiveChat() {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const hasRespondedRef = useRef(false);
    const messagesRef = useRef(messages);
    const cancelTokenSourceRef = useRef(null);
    const location = useLocation();
    const prevLocationRef = useRef(location);

    // Update messages ref when messages change
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Handle navigation changes
    useEffect(() => {
        if (prevLocationRef.current.pathname !== location.pathname) {
            cancelTokenSourceRef.current = cancelRequest(
                cancelTokenSourceRef.current, 
                "Request cancelled: You navigated away from the page."
            );
        }
        prevLocationRef.current = location;
    }, [location]);

    // Load user data
    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }

        return () => {
            cancelTokenSourceRef.current = cancelRequest(
                cancelTokenSourceRef.current,
                "Request cancelled: Component unmounted."
            );
        };
    }, []);

    // Cancel ongoing request handler
    const handleCancel = () => {
        cancelTokenSourceRef.current = cancelRequest(cancelTokenSourceRef.current);

        setMessages((prev) => {
            const updatedMessages = [...prev];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
                lastMessage.content = "There was an error when generating response: Request was cancelled.";

                localStorage.setItem(
                    `chat_${chatId}`,
                    JSON.stringify(updatedMessages)
                );
            }
            return updatedMessages;
        });

        setIsLoading(false);
    };

    // Handle assistant response
    const handleAssistantResponse = useCallback(
        async (userMessage) => {
            cancelTokenSourceRef.current = cancelRequest(cancelTokenSourceRef.current);
            setIsLoading(true);

            // Add thinking message
            setMessages((prev) => [
                ...prev,
                {
                    content: `Thinking...`, 
                    role: "assistant"
                },
            ]);

            // Create cancel token
            cancelTokenSourceRef.current = axios.CancelToken.source();

            // Get response from the assistant
            const { completeMessage, error } = await getAssistantResponse(
                userMessage, 
                messagesRef.current.slice(0, -1),
                {
                    cancelTokenSource: cancelTokenSourceRef.current,
                    chatId,
                    onProgress: (newText) => {
                        setMessages((prev) => {
                            const updatedMessages = [...prev];
                            const lastMessage = updatedMessages[updatedMessages.length - 1];
                            lastMessage.content = newText;

                            localStorage.setItem(
                                `chat_${chatId}`,
                                JSON.stringify(updatedMessages)
                            );
                            return updatedMessages;
                        });
                    }
                }
            );

            // Handle errors
            if (error) {
                setMessages((prev) => {
                    const updatedMessages = [...prev];
                    const lastMessage = updatedMessages[updatedMessages.length - 1];
                    if (lastMessage && lastMessage.role === "assistant") {
                        lastMessage.content = error.isCancel 
                            ? `There was an error when generating response: ${error.message}`
                            : "There was an error when generating response.";

                        localStorage.setItem(
                            `chat_${chatId}`,
                            JSON.stringify(updatedMessages)
                        );
                    }
                    return updatedMessages;
                });
            }

            setIsLoading(false);
            cancelTokenSourceRef.current = null;
        },
        [chatId]
    );

    // Load messages
    useEffect(() => {
        const loadMessages = async () => {
            const fetchedMessages = await fetchMessages(chatId);
            setMessages(fetchedMessages);

            // Auto-respond to first message if needed
            if (
                fetchedMessages.length === 1 &&
                fetchedMessages[0].role === "user" &&
                !hasRespondedRef.current
            ) {
                hasRespondedRef.current = true;

                setTimeout(() => {
                    handleAssistantResponse(fetchedMessages[0].content);
                }, 500);
            }
        };

        loadMessages();
    }, [chatId, handleAssistantResponse]);

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputValue.trim() === "") return;

        const userMessage = {
            content: inputValue,
            role: "user",
        };

        // Add user message to the chat
        setMessages((prev) => {
            const updatedMessages = [...prev, userMessage];
            localStorage.setItem(
                `chat_${chatId}`,
                JSON.stringify(updatedMessages)
            );
            return updatedMessages;
        });

        // Save the message
        await saveMessage(inputValue, "question", chatId);

        // Clear input and get AI response
        setInputValue("");
        await new Promise((resolve) => setTimeout(resolve, 500));
        await handleAssistantResponse(inputValue);
    };

    return (
        <div className="active-chat-container">
            <Sidebar />
            <div className="active-chat-content">
                <div className="active-chatbox-container">
                    <div className="active-chat-box">
                        <MessageList 
                            messages={messages} 
                            isLoading={isLoading} 
                        />
                        <MessageInput 
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            handleSubmit={handleSubmit}
                            isLoading={isLoading}
                            handleCancel={handleCancel}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActiveChat;
