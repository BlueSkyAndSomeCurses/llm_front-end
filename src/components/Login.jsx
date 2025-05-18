import { useState } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import bcrypt from "bcryptjs";
import "../styles/login.scss";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentIsLogin = isLogin;
        const currentName = name;
        const currentEmail = email;
        const currentPassword = password;
        const currentConfirmPassword = confirmPassword;

        try {
            if (currentIsLogin) {
                const response = await axios.post("/api/login", {
                    email: currentEmail,
                    password: currentPassword,
                });

                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                }

                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }

                navigate("/chat");
            } else {
                if (currentPassword !== currentConfirmPassword) {
                    setError("Passwords don't match");
                    return;
                }

                console.log("we are registering");

                const response = await axios.post("/api/register", {
                    name: currentName,
                    email: currentEmail,
                    password: currentPassword,
                });

                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                }

                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }

                navigate("/chat");
            }
        } catch (error) {
            if (error.response && error.response.data.name === "RejectedCreds") {
                setError(error.response.data.message);
            } else if (error.response.status === 400 &&
                (error.response.data.errorType === "weak_password" ||
                    error.response.data.errorType === "email_exists")) {
                setError(error.response.data.message);
            } else {
                console.error("Error:", error);
                setError(error.response?.data?.message || "Authentication failed");
            }
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError("");
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <h1>{isLogin ? "Login" : "Sign Up"}</h1>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                {!isLogin && (
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {!isLogin && (
                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                )}

                <button type="submit" className="submit-button">
                    {isLogin ? "Login" : "Sign Up"} <Send size={16} />
                </button>

                {error && <div className="error-message">{error}</div>}
            </form>

            <div className="toggle-mode">
                <p>
                    {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}
                </p>
                <button onClick={toggleMode} className="toggle-button">
                    {isLogin ? "Sign Up" : "Login"}
                </button>
            </div>
        </div>
    );
}

export default Login;
