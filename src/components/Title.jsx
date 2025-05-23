import { useState, useEffect, useRef } from "react";
import { Send, Settings, LogOut } from "lucide-react";
import "../styles/title.scss";
import "../styles/popups.scss";
import { useNavigate } from "react-router-dom";
import helloKittyLogo from "../assets/hello-kitty.png";
import UserButton from "./UserButton.jsx";
import UserSettings from "./UserSettings.jsx";
import Logo from "./Logo.jsx";

function TitlePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const loadUserData = () => {
            const userData = localStorage.getItem("user");
            if (userData && isMounted) {
                try {
                    setUser(JSON.parse(userData));
                } catch (error) {
                    console.error("Error parsing user data:", error);
                }
            }
        };
        loadUserData();

        const handleUserDataChanged = (event) => {
            if (isMounted && event.detail && event.detail.user) {
                setUser(event.detail.user);
            }
        };
        window.addEventListener('userDataChanged', handleUserDataChanged);

        return () => {
            isMounted = false;
            window.removeEventListener('userDataChanged', handleUserDataChanged);
        };
    }, []);


    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleTryNow = () => {
        if (user) {
            navigate("/chat");
        } else {
            navigate("/login");
        }
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };

    const handleSettings = () => {
        setShowSettings(true);
        setShowUserMenu(false);
    };

    const handleCloseSettings = () => {
        setShowSettings(false);
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const getInitial = () => {
        if (user && user.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return "U";
    };

    return (<div className="title-page">
        {showSettings && user && (<UserSettings onClose={handleCloseSettings} user={user} />)}

        <header className="header">
            <div className="header-content">
                <Logo />
                <div className="header-right">
                    {user ? (<div className="user-header-container" ref={menuRef}>
                        <button className="user-button" onClick={toggleUserMenu} title={user.name}>
                            <div className="user-avatar">
                                {user.avatar ? (<img src={user.avatar} alt={user.name}
                                    className="avatar-image" />) : (getInitial())}

                            </div>
                            <span className="user-name">
                                {user.name}
                            </span>
                        </button>

                        {showUserMenu && (<div className="dropdown-user-menu">
                            <div className="user-info">
                                <span className="user-fullname">{user.name}</span>
                                {user.email && <span className="user-email">{user.email}</span>}
                            </div>
                            <div className="menu-items">
                                <div className="menu-item" onClick={handleSettings}>
                                    <Settings size={16} />
                                    <span>Settings</span>
                                </div>
                                <div className="menu-item" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </div>
                            </div>
                        </div>)}
                    </div>) : (<button className="login-button" onClick={() => navigate("/login")}>
                        Login
                    </button>)}
                </div>
            </div>
        </header>
        <section className="title-section">
            <div className="logo-container">
                <img src={helloKittyLogo} alt="Logo" className="logo-image" />
                <h3 className="logo-text">Kitty Chat</h3>
            </div>
            <h1 className="title">Ask smarter. Learn faster.
                Achieve more.</h1>
            <p className="description">Meet your new AI sidekick—wrapped in whiskers and wit! This LLM doesn’t just think outside the box, it curls up inside it 🐾. Smarter answers, softer landings, and a playful purr in every response.</p>
            <button className="try-button" onClick={handleTryNow}>
                Try Now <Send size={16} />
            </button>
        </section>
        <section className="features-section">
            <div className="features-content">
                <h2 className="features-title">Features</h2>
                <p className="description">Our service provides not only default LLM interface. We introduce unique
                    features which makes our client one of the best in its kind!</p>
                <div className="features">
                    <div className="feature-card">
                        <div className="feature-image-container">
                            <div className="eating-animation"></div>
                            <div className="feature-text">
                                <h3>Natural Conversations</h3>
                                <p>Engage in fluid, natural conversations with our advanced AI assistant</p>
                            </div>
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-image-container">
                            <div className="eating-animation"></div>
                            <div className="feature-text">
                                <h3>Personalized Responses</h3>
                                <p>Get tailored answers based on your unique questions and preferences</p>
                            </div>
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-image-container">
                            <div className="eating-animation"></div>
                            <div className="feature-text">
                                <h3>Secure Messaging</h3>
                                <p>Enjoy private and secure conversations with end-to-end encryption</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="about-section">
            <div className="about-content">
                <h2 className="about-title">About Us</h2>
                <p className="about-description">Kitty Chat combines cutting-edge AI technology with a delightful
                    interface to create the most adorable yet powerful chat experience. Our team is passionate about
                    making AI accessible, helpful, and fun for everyone.</p>

                <div className="values-container">
                    <div className="value-item">
                        <h3>Our Mission</h3>
                        <p>To create AI assistants that are not only smart but also intuitive and enjoyable to
                            interact with, bringing a touch of joy to every conversation.</p>
                    </div>
                    <div className="value-item">
                        <h3>Our Vision</h3>
                        <p>A world where technology feels personal, approachable, and delightful - where AI
                            assistants understand not just what you say, but how you feel.</p>
                    </div>
                    <div className="value-item">
                        <h3>Our Values</h3>
                        <p>We believe in building technology with heart, prioritizing user privacy, and creating
                            experiences that bring smiles to people's faces.</p>
                    </div>
                </div>
            </div>
        </section>
        <footer className="title-footer">
            <p>© 2025 Hello Kitty Chat. All rights reserved.</p>
        </footer>
    </div>);
}

export default TitlePage;