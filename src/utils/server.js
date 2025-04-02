import express, {json} from "express";
import {mongoose, connect} from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";
import Message from "../models/message.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));
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

    if (!token)
        return res.status(401).json({message: "Authentication token required"});

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({message: "Invalid or expired token"});
        req.user = user;
        next();
    });
};

// Initialize OpenAI
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

app.get("/", (req, res) => {
    res.send("Hello from Express");
});

app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({message: "This is protected data", user: req.user});
});

app.post("/api/login", async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if (!user) {
            return res.status(401).json({message: "The user does not exist"});
        }
        if (user.password !== password) {
            return res.status(401).json({message: "Invalid email or password"});
        }

        const token = jwt.sign(
            {id: user._id, email: user.email, name: user.name},
            JWT_SECRET,
            {expiresIn: "24h"}
        );

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
        };

        res.status(200).json({
            message: "Login successful",
            user: userResponse,
            token: token,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({message: "Login failed"});
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const {name, email, password} = req.body;

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res
                .status(400)
                .json({message: "User with this email already exists"});
        }

        const newUser = new User({
            name,
            email,
            password,
        });

        await newUser.save();

        const token = jwt.sign(
            {id: newUser._id, email: newUser.email, name: newUser.name},
            JWT_SECRET,
            {expiresIn: "24h"}
        );

        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        };

        res.status(201).json({
            message: "Registration successful",
            user: userResponse,
            token: token,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({message: "Registration failed"});
    }
});

app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
        const {messageText, chatId, messageType = "question"} = req.body;
        const userId = req.user.id;

        const newMessage = new Message({
            userId,
            messageText,
            messageType,
            chatId,
        });

        await newMessage.save();

        res.status(201).json({
            message: "Message saved successfully",
            data: newMessage,
        });
    } catch (error) {
        console.error("Message creation error:", error);
        res.status(500).json({message: "Failed to save message"});
    }
});

app.get("/api/messages/:chatId", authenticateToken, async (req, res) => {
    try {
        const {chatId} = req.params;
        const userId = req.user.id;

        const messages = await Message.find({
            userId,
            chatId,
        }).sort({messageNum: 1});

        res.status(200).json({
            messages,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({message: "Failed to fetch messages"});
    }
});

app.get("/api/chats", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const chats = await Message.find({
            userId,
            messageNum: 0,
        }).sort({timestamp: -1});

        res.status(200).json({
            chats,
        });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({message: "Failed to fetch chats"});
    }
});

app.post("/api/chat", authenticateToken, async (req, res) => {
    try {
        const {message} = req.body;

        console.log("message", message);

        const completion = await openai.chat.completions.create({
            model:"deepseek/deepseek-r1-distill-qwen-14b:free",
            messages: [
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        const response = completion.choices[0].message.content;
        res.json({response});
    } catch (error) {
        console.error("Error getting LLM response:", error);
        res.status(500).json({error: "Failed to get response from LLM"});
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
