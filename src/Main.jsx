import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import "./index.css";
import Chat from "./components/Chat.jsx";
import ActiveChat from "./components/ActiveChat.jsx";
import Login from "./components/Login.jsx";
import Title from "./components/Title.jsx";
import History from "./components/History.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ToastContainer from "./components/ToastContainer.jsx";

import "./utils/authHelpers.js";

createRoot(document.getElementById("root")).render(<StrictMode>
    <BrowserRouter>
        <ToastContainer/>
        <Routes>
            <Route path="/" element={<Title/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/chat" element={<ProtectedRoute>
                <Chat/>
            </ProtectedRoute>}/>
            <Route path="/chat/:chatId" element={<ProtectedRoute>
                <ActiveChat/>
            </ProtectedRoute>}/>
            <Route path="/history" element={<ProtectedRoute>
                <History/>
            </ProtectedRoute>}/>
        </Routes>
    </BrowserRouter>
</StrictMode>);
