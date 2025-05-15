import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/activechat.scss";
import "../styles/sidebar.scss";
import Sidebar from "./Sidebar";
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

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        if (prevLocationRef.current.pathname !== location.pathname) {
            cancelTokenSourceRef.current = cancelRequest(
                cancelTokenSourceRef.current,
                "Request cancelled: You navigated away from the page."
            );
        }
        prevLocationRef.current = location;
    }, [location]);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Listen for user data changes from other components
        const handleUserDataChanged = (event) => {
            if (event.detail && event.detail.user) {
                setUser(event.detail.user);
            }
        };

        window.addEventListener('userDataChanged', handleUserDataChanged);

        return () => {
            cancelTokenSourceRef.current = cancelRequest(
                cancelTokenSourceRef.current,
                "Request cancelled: Component unmounted."
            );
            window.removeEventListener('userDataChanged', handleUserDataChanged);
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

                localStorage.setItem(
                    `chat_${chatId}`,
                    JSON.stringify(updatedMessages)
                );
            }
            return updatedMessages;
        });

        setIsLoading(false);
    };

    const handleAssistantResponse = useCallback(
        async (userMessage) => {
            cancelTokenSourceRef.current = cancelRequest(cancelTokenSourceRef.current);
            setIsLoading(true);

            setMessages((prev) => [
                ...prev,
                {
                    content: `Thinking...`,
                    role: "assistant"
                },
            ]);

            cancelTokenSourceRef.current = axios.CancelToken.source();

            const { completeMessage, error } = await getAssistantResponse(
                userMessage,
                messagesRef.current.slice(0, -1),
                {
                    cancelTokenSource: cancelTokenSourceRef.current,
                    chatId,
                    onProgress: (newText) => {
                        setMessages((prevMessages) => {
                            const updatedMessages = [...prevMessages];
                            const lastIndex = updatedMessages.length - 1;

                            if (lastIndex >= 0 && updatedMessages[lastIndex].role === "assistant") {
                                updatedMessages[lastIndex] = {
                                    ...updatedMessages[lastIndex],
                                    content: newText
                                };

                                localStorage.setItem(
                                    `chat_${chatId}`,
                                    JSON.stringify(updatedMessages)
                                );
                            }

                            return updatedMessages;
                        });
                    }
                }
            );

            if (error) {
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    const lastIndex = updatedMessages.length - 1;

                    if (lastIndex >= 0 && updatedMessages[lastIndex].role === "assistant") {
                        updatedMessages[lastIndex] = {
                            ...updatedMessages[lastIndex],
                            content: error.isCancel
                                ? `There was an error when generating response: ${error.message}`
                                : "There was an error when generating response."
                        };

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
        let isMounted = true;
        const abortController = new AbortController();

        const loadMessages = async () => {
            try {
                const fetchedMessages = await fetchMessages(chatId, abortController.signal);

                if (isMounted) {
                    setMessages(fetchedMessages);

                    if (
                        fetchedMessages.length === 1 &&
                        fetchedMessages[0].role === "user" &&
                        !hasRespondedRef.current
                    ) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputValue.trim() === "") return;

        const currentInputValue = inputValue;

        const userMessage = {
            content: currentInputValue,
            role: "user",
        };

        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, userMessage];

            localStorage.setItem(
                `chat_${chatId}`,
                JSON.stringify(updatedMessages)
            );
            return updatedMessages;
        });

        setInputValue("");

        await saveMessage(currentInputValue, "question", chatId);


        await new Promise((resolve) => setTimeout(resolve, 500));

        await handleAssistantResponse(currentInputValue);
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
