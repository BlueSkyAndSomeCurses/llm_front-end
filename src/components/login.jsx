import { useState } from "react";
import { Send } from "lucide-react";
import "./App.css";

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(isLogin ? "Log in" : "Sign up", email, password);
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <h1>{isLogin ? "Login" : "Sign Up"}</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
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
                        <label htmlFor="confirmPassword">Confirm Password</label>
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
            </form>
            
            <div className="toggle-mode">
                <p>{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
                <button onClick={toggleMode} className="toggle-button">
                    {isLogin ? "Sign Up" : "Login"}
                </button>
            </div>
        </div>
    );
}

export default Login;