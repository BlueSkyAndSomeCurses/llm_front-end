import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Chat from "./components/chat.jsx";
import ActiveChat from "./components/activechat.jsx";
import Login from "./components/login.jsx";
import Title from "./components/title.jsx";
import History from "./components/history.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./utils/authHelpers.js";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Title />} />
                <Route path="/login" element={<Login />} />
                <Route path="/chat" element={
                    <ProtectedRoute>
                        <Chat />
                    </ProtectedRoute>
                } />
                <Route path="/chat/:chatId" element={
                    <ProtectedRoute>
                        <ActiveChat />
                    </ProtectedRoute>
                } />
                <Route path="/history" element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
