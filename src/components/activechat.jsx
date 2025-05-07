import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import '../styles/markdown.scss';
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DiscAlbum, Send, XCircle } from "lucide-react";
import axios from "axios";
import "../styles/activechat.scss";
import "../styles/sidebar.scss";
import Sidebar from "./sidebar";
import HelloKittyAssistant from "./HelloKittyAssistant";
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
    const cancelTokenSourceRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const prevLocationRef = useRef(location);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        if (prevLocationRef.current.pathname !== location.pathname) {
            cancelOngoingRequest("Request cancelled: You navigated away from the page.");
        }
        prevLocationRef.current = location;
    }, [location]);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }

        return () => {
            cancelOngoingRequest("Request cancelled: Component unmounted.");
        };
    }, []);

    const cancelOngoingRequest = (reason) => {
        if (cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel(reason || "Request manually cancelled.");
            cancelTokenSourceRef.current = null;
        }
    };

    const handleCancel = () => {
        cancelOngoingRequest();

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

    const handleAssistantResponse = useCallback(
        async (userMessage) => {
            cancelOngoingRequest();

            setIsLoading(true);
            let completeMessage = "";

            try {
                setMessages((prev) => [
                    ...prev,
                    {
                        content: `Thinking...`, role: "assistant"
                    },
                ]);

                const token = localStorage.getItem("token");
                cancelTokenSourceRef.current = axios.CancelToken.source();

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
                        cancelToken: cancelTokenSourceRef.current.token,
                        responseType: "text",
                        onDownloadProgress: (progressEvent) => {
                            console.log("Progress event:", progressEvent);
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
                if (axios.isCancel(error)) {
                    console.log('Request canceled:', error.message);
                    setMessages((prev) => {
                        const updatedMessages = [...prev];
                        const lastMessage = updatedMessages[updatedMessages.length - 1];
                        if (lastMessage && lastMessage.role === "assistant") {
                            lastMessage.content = `There was an error when generating response: ${error.message}`;

                            localStorage.setItem(
                                `chat_${chatId}`,
                                JSON.stringify(updatedMessages)
                            );
                        }
                        return updatedMessages;
                    });
                } else {
                    setMessages((prev) => {
                        const updatedMessages = [...prev];
                        const lastMessage = updatedMessages[updatedMessages.length - 1];
                        if (lastMessage && lastMessage.role === "assistant") {
                            lastMessage.content = "There was an error when generating response.";

                            localStorage.setItem(
                                `chat_${chatId}`,
                                JSON.stringify(updatedMessages)
                            );
                        }
                        return updatedMessages;
                    });
                }
            } finally {
                setIsLoading(false);
                cancelTokenSourceRef.current = null;
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
        if (messagesEndRef.current) {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        }
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const textareaRef = useRef(null);

    const resizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
        }
    };

    useEffect(() => {
        resizeTextarea();
    }, [inputValue]);

    // Determine if there's at least one assistant message in the conversation
    const hasAssistantMessage = messages.some(msg => msg.role === 'assistant');

    return (
        <div className="active-chat-container">
            <Sidebar />
            <div className="active-chat-content">
                <div className="active-chatbox-container">
                    <div className="active-chat-box">
                        <div className="active-messages-area">
                            {messages.map((msg, i) => (
                                <div key={i} className={`active-message ${msg.role}-message`}>
                                    {msg.role === "assistant" ? (
                                        <div className="markdown-content">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm, [remarkMath, {
                                                    inlineMath: [['\\(', '\\)']],
                                                    displayMath: [['\\[', '\\]']]
                                                }], remarkBreaks]}
                                                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                                            >
                                                {msg.content.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$').replace(/\\\(/g, '$').replace(/\\\)/g, '$')}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div>{msg.content}</div>
                                    )}
                                </div>
                            ))}
                            
                            {/* Hello Kitty Assistant character */}
                            {(hasAssistantMessage || isLoading) && (
                                <HelloKittyAssistant isThinking={isLoading} />
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="form-wrapper">
                            <form
                                className="active-chat-input"
                                onSubmit={handleSubmit}>
                                <textarea
                                    ref={textareaRef}
                                    className="active-input-field multiline"
                                    placeholder="Type a message... (Shift+Enter for new line)"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                />
                                <div className="active-input-utils">
                                    <button
                                        type={isLoading ? "button" : "submit"}
                                        onClick={isLoading ? handleCancel : undefined}
                                        className={`active-send-button ${isLoading ? "cancel-button" : ""}`}>
                                        {isLoading ? <XCircle size={20} /> : <Send size={20} />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActiveChat;
