import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import "./index.css";
import Chat from "./components/chat.jsx";
import ActiveChat from "./components/activechat.jsx";
import Login from "./components/login.jsx";
import Title from "./components/title.jsx";
import History from "./components/history.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Title />} />
                <Route path="/login" element={<Login />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:chatId" element={<ActiveChat />} />
                <Route path="/history" element={<History />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
