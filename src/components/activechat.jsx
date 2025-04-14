import { useState, useEffect, useRef, useCallback, use } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import axios from "axios";
import "../styles/activechat.scss";
import "../styles/sidebar.scss";
import Sidebar from "./sidebar";
import { getLLMResponse } from "../utils/llm_rest";

function ActiveChat() {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const hasRespondedRef = useRef(false);
    const messagesEndRef = useRef(null);
    const messagesRef = useRef(messages);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleAssistantResponse = useCallback(
        async (userMessage) => {

            setIsLoading(true);
            let completeMessage = "";

            try {
                setMessages((prev) => [
                    ...prev,
                    { content: "", role: "assistant" },
                ]);

                const token = localStorage.getItem("token");
                console.log("ne", messagesRef.current);

                const response = await axios.post(
                    "/api/chat",
                    {
                        message: userMessage,
                        model: localStorage.getItem("selectedModel"),
                        context: messagesRef.current.slice(0, -1),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        responseType: "text",
                        onDownloadProgress: (progressEvent) => {
                            const newText =
                                progressEvent.event?.target?.response;
                            if (newText) {
                                completeMessage = newText;
                                setMessages((prev) => {
                                    const updatedMessages = [...prev];
                                    const lastMessage =
                                        updatedMessages[
                                        updatedMessages.length - 1
                                        ];
                                    lastMessage.content = newText;

                                    localStorage.setItem(
                                        `chat_${chatId}`,
                                        JSON.stringify(updatedMessages)
                                    );
                                    return updatedMessages;
                                });
                            }
                        },
                    }
                );

                try {
                    if (token) {
                        await axios.post(
                            "/api/messages",
                            {
                                messageText: completeMessage,
                                messageType: "response",
                                chatId: chatId,
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
            } catch (error) {
                console.error("Error generating response:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [chatId]
    );

    useEffect(() => {
        const fetchMessages = async () => {
            const savedMessages = localStorage.getItem(`chat_${chatId}`);
            if (savedMessages) {
                const parsedMessages = JSON.parse(savedMessages);
                setMessages(parsedMessages);

                if (
                    parsedMessages.length === 1 &&
                    parsedMessages[0].role === "user" &&
                    !hasRespondedRef.current
                ) {
                    hasRespondedRef.current = true;

                    setTimeout(() => {
                        handleAssistantResponse(parsedMessages[0].content);
                    }, 500);
                }
            } else {
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
                            setMessages(serverMessages);
                            localStorage.setItem(
                                `chat_${chatId}`,
                                JSON.stringify(serverMessages)
                            );
                        }
                    }
                } catch (error) {
                    console.error(
                        "Error fetching messages from server:",
                        error
                    );
                }
            }
        };

        fetchMessages();
    }, [chatId, handleAssistantResponse]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputValue.trim() === "") return;

        const userMessage = {
            content: inputValue,
            role: "user",
        };

        setMessages((prev) => {
            const updatedMessages = [...prev, userMessage];
            localStorage.setItem(
                `chat_${chatId}`,
                JSON.stringify(updatedMessages)
            );
            return updatedMessages;
        });

        try {
            const token = localStorage.getItem("token");
            if (token) {
                await axios.post(
                    "/api/messages",
                    {
                        messageText: inputValue,
                        messageType: "question",
                        chatId: chatId,
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

        setInputValue("");


        await new Promise((resolve) => setTimeout(resolve, 500));
        await handleAssistantResponse(inputValue, messages.slice(-6));
    };

    return (
        <div className="active-chat-container">
            <Sidebar />
            <div className="active-chat-content">
                <div className="active-chatbox-container">
                    <div className="active-chat-box">
                        <div className="active-messages-area">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`active-message ${msg.role}-message`}>
                                    {msg.content.split('\n').map((line, index) => (
                                        <span key={index}>
                                            {line}
                                            {index < msg.content.split('\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form
                            className="active-chat-input"
                            onSubmit={handleSubmit}>
                            <input
                                type="text"
                                className="active-input-field"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                            />
                            <div className="active-input-utils">
                                <button
                                    type="submit"
                                    className="active-send-button"
                                    disabled={isLoading}>
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActiveChat;
