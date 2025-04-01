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
            <header className="title-header">
                <div className="title-content">
                    <h1 className="title">Welcome to Hello Kitty Chat</h1>
                    <p className="description">Your personal assistant powered by AI.</p>
                </div>
                <div className="header-image">
                    <img src="/path/to/image.jpg" alt="AI Assistant" />
                </div>
            </header>
            <section className="try-section">
                <div className="try-content">
                    <h2 className="try-title">Try it out</h2>
                    <p className="try-description">Experience the power of our AI assistant.</p>
                    <button className="try-button" onClick={handleTryNow}>
                        Try Now <Send size={16} />
                    </button>
                </div>
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