import { useState } from "react";
import { Send } from "lucide-react";
import "../styles/title.scss";
import { useNavigate } from "react-router-dom";

function TitlePage() {
    const navigate = useNavigate();

    const handleTryNow = () => {
        navigate("/chat");
    };

    return (
        <div className="title-page">
            <header className="header">
                <div className="header-content">
                    <span className="logo">FC Slavuta</span>
                    <button className="login-button" onClick={() => navigate("/login")}>
                        Login
                    </button>
                </div>
            </header>
            <section className="title-section">
                <span className="hellokittychat">Hello Kitty Chat</span>
                <h1 className="title">Ask smarter. Learn faster. Achieve more.</h1>
                <p className="description">Your personal assistant powered by AI.</p>
                <button className="try-button" onClick={handleTryNow}>
                    Try Now <Send size={16} />
                </button>
            </section>
            <section className="features-section">
                <div className="features-content">
                    <h2 className="features-title">Features</h2>
                    <ul className="features-list">
                        <li className="feature-item">Natural conversation with advanced AI</li>
                        <li className="feature-item">Personalized responses to your queries</li>
                        <li className="feature-item">Secure messaging and private conversations</li>
                    </ul>
                </div>
            </section>
            <section className="about-section">
                <div className="about-content">
                    <h2 className="about-title">About Us</h2>
                    <p className="about-description">We're dedicated to making AI accessible and helpful for everyone.</p>
                </div>
            </section>
            <footer className="title-footer">
                <p>© 2024 Hello Kitty Chat. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default TitlePage;