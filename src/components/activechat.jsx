import {useState, useEffect, useRef, useCallback} from "react";
import {useParams} from "react-router-dom";
import {Send} from "lucide-react";
import axios from "axios";
import "./activechat.scss";
import "./sidebar.scss";
import Sidebar from "./sidebar";

function ActiveChat() {
    const {chatId} = useParams();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const hasRespondedRef = useRef(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const generateMockResponse = (userMessage) => {
        const responses = [
            "Hello! I'm excited to chat with you about this.",
            "What an intriguing topic! Let me share my thoughts...",
            "I'd be happy to explore this with you in detail:",
            "This is something I know quite a bit about...",
            "Let me offer a different perspective on this:",
            "I find this fascinating. Here's my take:",
            "Thanks for bringing this up! My thoughts are:",
            "I've given this some careful consideration...",
            "This is an excellent discussion point. Let me elaborate:",
            "I appreciate you asking about this. Here's what I know:",
            "Let's dive deeper into this topic together:",
            "I have some relevant experience to share here:",
            "This reminds me of something interesting...",
            "There are several ways to look at this:",
            "I'm glad you brought this up. Let's explore it:",
            "I'm here to help you with any questions you have.",
        ];

        return new Promise((resolve) => {
            setTimeout(() => {
                const randomResponse =
                    responses[Math.floor(Math.random() * responses.length)];
                resolve(
                    randomResponse +
                        " " +
                        userMessage.split(" ").slice(0, 5).join(" ") +
                        "..."
                );
            }, 1000);
        });
    };

    const handleAssistantResponse = useCallback(
        async (userMessage) => {
            setIsLoading(true);
            console.log("handleAssistantResponse called, user state:", user);

            try {
                setMessages((prev) => [
                    ...prev,
                    {text: "Thinking...", sender: "assistant"},
                ]);

                const mockResponse = await generateMockResponse(userMessage);
                const assistantMessage = {
                    text: mockResponse,
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

                // Save assistant message to the database
                try {
                    // Get token directly from localStorage instead of relying on user state
                    const token = localStorage.getItem("token");

                    if (token) {
                        console.log(
                            "Got token directly from localStorage, saving assistant message"
                        );

                        const response = await axios.post(
                            "/api/messages",
                            {
                                messageText: mockResponse,
                                messageType: "response", // Set type to "response" for assistant messages
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
            // First load from localStorage for immediate display
            const savedMessages = localStorage.getItem(`chat_${chatId}`);
            if (savedMessages) {
                const parsedMessages = JSON.parse(savedMessages);
                setMessages(parsedMessages);

                // Check if this is a new chat with only one message
                if (
                    parsedMessages.length === 1 &&
                    parsedMessages[0].sender === "user" &&
                    !hasRespondedRef.current
                ) {
                    hasRespondedRef.current = true;

                    // Add a delay to ensure everything is loaded before generating the first response
                    setTimeout(() => {
                        console.log("Triggering initial assistant response");
                        handleAssistantResponse(parsedMessages[0].text);
                    }, 500);
                }
            }

            // Then try to fetch from the database if token exists
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

                    // If we have database messages, we could update the UI or sync with localStorage
                    // For this implementation, we'll keep using localStorage for simplicity
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
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
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

        // Save user message to database
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
