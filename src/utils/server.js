import express, {
    json
} from "express";
import {
    mongoose,
    connect
} from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";
import Message from "../models/message.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import OpenAI from "openai";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{8,}$/;


const models = {
    "DeepSeek R1": "deepseek/deepseek-r1-distill-qwen-14b:free",
    QWEN: "qwen/qwen2.5-vl-3b-instruct:free",
    "LLaMa 4 scout": "meta-llama/llama-4-maverick:free",
};

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));

app.use(express.json());

connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "llm-frontend-web-project",
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => {
    console.log("Connected to MongoDB");
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const refreshToken = req.cookies.refreshToken;

    if (!token && !refreshToken) {
        return res.status(401).json({
            message: "Authentication token required"
        });
    }

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                if (!refreshToken) {
                    return res.status(403).json({
                        message: "Invalid or expired token"
                    });
                }

                return handleRefreshToken(req, res, next);
            }

            req.user = user;
            next();
        });
    } else if (refreshToken) {
        handleRefreshToken(req, res, next);
    }
};

const handleRefreshToken = (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token required"
        });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, userData) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid or expired refresh token",
                tokenExpired: true
            });
        }
        try {
            const user = await User.findById(userData.id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const accessToken = jwt.sign({
                id: user._id,
                email: user.email,
                name: user.name,
            }, JWT_SECRET, {
                expiresIn: "24h"
            });

            res.set("X-New-Access-Token", accessToken);

            req.user = {
                id: user._id,
                email: user.email,
                name: user.name
            };

            next();
        } catch (error) {
            console.error("Error refreshing token:", error);
            return res.status(500).json({
                message: "Error refreshing authentication"
            });
        }
    });
};

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

app.get("/", (req, res) => {
    res.send("Hello from Express");
});

app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({
        message: "This is protected data",
        user: req.user
    });
});

app.get("/api/check-auth", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const refreshToken = req.cookies.refreshToken;

    if (!token && !refreshToken) {
        return res.status(401).json({
            authenticated: false,
            message: "No authentication tokens found"
        });
    }

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                if (!refreshToken) {
                    return res.status(403).json({
                        authenticated: false,
                        message: "Invalid or expired token"
                    });
                } else {
                    verifyRefreshToken(req, res);
                }
            } else {
                return res.status(200).json({
                    authenticated: true,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            }
        });
    } else if (refreshToken) {
        verifyRefreshToken(req, res);
    }
});

const verifyRefreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, userData) => {
        if (err) {
            return res.status(403).json({
                authenticated: false,
                message: "Invalid or expired refresh token"
            });
        }

        try {
            const user = await User.findById(userData.id);

            if (!user) {
                return res.status(404).json({
                    authenticated: false,
                    message: "User not found"
                });
            }

            const accessToken = jwt.sign({
                id: user._id,
                email: user.email,
                name: user.name,
            }, JWT_SECRET, {
                expiresIn: "24h"
            });

            return res.status(200).json({
                authenticated: true,
                newAccessToken: accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            console.error("Error during refresh token verification:", error);
            return res.status(500).json({
                authenticated: false,
                message: "Error verifying authentication"
            });
        }
    });
};

app.post("/api/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(401).json({
                message: "The user does not exist",
                name: "RejectedCreds"
            });
        }
        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid email or password",
                name: "RejectedCreds"

            });
        }

        const accessToken = jwt.sign({
            id: user._id,
            email: user.email,
            name: user.name,
        }, JWT_SECRET, {
            expiresIn: "24h"
        });
        const refreshToken = jwt.sign({
            id: user._id,
            email: user.email
        }, JWT_REFRESH_SECRET, {
            expiresIn: "30d"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        };

        res.status(200).json({
            message: "Login successful",
            user: userResponse,
            token: accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Login failed"
        });
    }
});

app.post("/api/logout", (req, res) => {
    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "Logout successful"
    });
});

app.post("/api/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        const existingUser = await User.findOne({
            email
        });
        if (existingUser) {
            return res
                .status(400)
                .json({
                    message: "User with this email already exists",
                    errorType: "email_exists"
                });
        }
        if (!strongPasswordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
                errorType: "weak_password"
            });
        }

        const newUser = new User({
            name,
            email,
            password,
        });

        await newUser.save();

        const accessToken = jwt.sign({
                id: newUser._id,
                email: newUser.email,
                name: newUser.name
            },
            JWT_SECRET, {
                expiresIn: "24h"
            }
        );

        const refreshToken = jwt.sign({
                id: newUser._id,
                email: newUser.email
            },
            JWT_SECRET, {
                expiresIn: "30d"
            }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        };

        res.status(201).json({
            message: "Registration successful",
            user: userResponse,
            token: accessToken,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Registration failed"
        });
    }
});

app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
        const {
            messageText,
            chatId,
            messageType = "question",
            modelName
        } = req.body;
        const userId = req.user.id;

        let selectedModelName = modelName;

        const newMessage = new Message({
            userId,
            messageText,
            messageType,
            chatId,
            modelName: selectedModelName,
        });

        await newMessage.save();

        res.status(201).json({
            message: "Message saved successfully",
            data: newMessage,
        });
    } catch (error) {
        console.error("Message creation error:", error);
        res.status(500).json({
            message: "Failed to save message"
        });
    }
});

app.get("/api/messages/:chatId", authenticateToken, async (req, res) => {
    try {
        const {
            chatId
        } = req.params;
        const userId = req.user.id;

        const messages = await Message.find({
            userId,
            chatId,
        }).sort({
            messageNum: 1
        });

        res.status(200).json({
            messages,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            message: "Failed to fetch messages"
        });
    }
});

app.get("/api/chat/:chatId/model", authenticateToken, async (req, res) => {
    try {
        const {chatId} = req.params;
        const userId = req.user.id;

        // Get just the first message (usually has the model selection)
        const firstMessage = await Message.findOne({
            userId,
            chatId,
            messageNum: 0 // The first message in a chat
        });

        if (!firstMessage) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        res.status(200).json({
            modelName: firstMessage.modelName
        });
    } catch (error) {
        console.error("Error fetching model name:", error);
        res.status(500).json({
            message: "Failed to fetch model name"
        });
    }
});

app.get("/api/chats", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const chats = await Message.find({
            userId,
            messageNum: 0,
        }).sort({
            timestamp: -1
        });

        res.status(200).json({
            chats,
        });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({
            message: "Failed to fetch chats"
        });
    }
});

app.post("/api/chat", authenticateToken, async (req, res) => {
    try {
        const {
            message,
            chatId
        } = req.body;
        let selectedModel = req.body.model;

        if (chatId) {
            const lastMessage = await Message.findOne({
                userId: req.user.id,
                chatId
            }, {}, {
                sort: {
                    messageNum: -1
                }
            });

            if (lastMessage && lastMessage.modelName) {
                selectedModel = lastMessage.modelName;
            }
        }

        selectedModel = models[selectedModel];

        const completion = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                ...req.body.context,
                {
                    role: "user",
                    content: message,
                },
            ],
            stream: true,
        }, {
            responseType: "stream"
        });

        res.setHeader("Content-Type", "application/json; charset = utf-8");
        res.setHeader("Transfer-Encoding", "chunked");

        for await (const chunk of completion) {
            if (chunk.choices[0]?.delta?.content) {
                const retrievedContent = chunk.choices[0].delta.content;
                res.write(retrievedContent);
            }
        }

        res.end();
    } catch (error) {
        console.error("Error getting LLM response:", error);
        res.status(500).json({
            error: "Failed to get response from LLM"
        });
    }
});


app.put("/api/user/profile", authenticateToken, async (req, res) => {
    try {
        const {name, avatar} = req.body;
        const userId = req.user.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...(name && {name}),
                ...(avatar !== undefined && {avatar})
            },
            {new: true, select: '-password'}
        );

        if (!updatedUser) {
            return res.status(404).json({message: "User not found"});
        }

        const userResponse = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
        };

        let token = req.headers.authorization.split(" ")[1];
        if (name) {
            token = jwt.sign(
                {id: updatedUser._id, email: updatedUser.email, name: updatedUser.name},
                JWT_SECRET,
                {expiresIn: "24h"}
            );
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: userResponse,
            token: name ? token : undefined
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({message: "Failed to update profile"});
    }
});

app.put("/api/user/password", authenticateToken, async (req, res) => {
    try {
        const {currentPassword, newPassword} = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        if (user.password !== currentPassword) {
            return res.status(401).json({message: "Current password is incorrect"});
        }

        if (!strongPasswordRegex.test(newPassword)) {
            return res.status(400).json({
                message: "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Password update error:", error);
        res.status(500).json({message: "Failed to update password"});
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});