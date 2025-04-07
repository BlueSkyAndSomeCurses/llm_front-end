import { useState, useEffect, useRef, useCallback } from "react";
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

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleAssistantResponse = useCallback(
        async (userMessage) => {
            console.log("HAPPEND", userMessage);
            setIsLoading(true);
            console.log("handleAssistantResponse called, user state:", user);

            try {
                setMessages((prev) => [
                    ...prev,
                    { text: "Thinking...", sender: "assistant" },
                ]);

                const llmResponse = await getLLMResponse(userMessage);
                const assistantMessage = {
                    text: llmResponse,
                    sender: "assistant",
                };

                setMessages((prev) => {
                    const updatedMessages = [
                        ...prev.slice(0, -1),
                        assistantMessage,
                    ];
                    localStorage.setItem(
                        `chat_${chatId}`,
                        JSON.stringify(updatedMessages)
                    );
                    return updatedMessages;
                });

                try {
                    const token = localStorage.getItem("token");

                    if (token) {
                        console.log(
                            "Got token directly from localStorage, saving assistant message"
                        );

                        const response = await axios.post(
                            "/api/messages",
                            {
                                messageText: llmResponse,
                                messageType: "response",
                                chatId: chatId,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        console.log("Saved assistant message:", response.data);
                    } else {
                        console.log("No token available in localStorage");
                    }
                } catch (error) {
                    console.error("Error saving assistant message:", error);
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
                    parsedMessages[0].sender === "user" &&
                    !hasRespondedRef.current
                ) {
                    hasRespondedRef.current = true;

                    setTimeout(() => {
                        console.log("Triggering initial assistant response");
                        handleAssistantResponse(parsedMessages[0].text);
                    }, 500);
                }
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

                    console.log(
                        "Messages from database:",
                        response.data.messages
                    );
                }
            } catch (error) {
                console.error("Error fetching messages from database:", error);
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
            text: inputValue,
            sender: "user",
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
                console.log("Saving user message to database");
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
        await handleAssistantResponse(inputValue);
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
                                    className={`active-message ${msg.sender}-message`}>
                                    {msg.text}
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
