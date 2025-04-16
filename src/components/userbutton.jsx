import { useState, useEffect, useRef } from "react";
import { Settings, LogOut, User, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.scss";
import "../styles/popups.scss";

function UserButton({ size, expanded }) {
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    const popupRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleSettings = () => {
        console.log("Settings clicked");
        setShowPopup(false);
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const togglePopup = () => {
        if (user) {
            setShowPopup(!showPopup);
        } else {
            handleLogin();
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowPopup(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getInitial = () => {
        if (user && user.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return "U";
    };

    return (
        <div className="user-button-container">
            <button className="user-button" onClick={togglePopup} title={user ? user.name : "Login"}>
                {user ? (
                    <>
                        <div className="user-avatar">
                            {getInitial()}
                        </div>
                        {expanded && (
                            <span className="user-name">
                                {user.name}
                            </span>
                        )}
                    </>
                ) : (
                    <>
                        <div className="login-avatar">
                            <LogIn size={20} />
                        </div>
                        {expanded && (
                            <span className="user-name">
                                Login
                            </span>
                        )}
                    </>
                )}
            </button>

            {user && showPopup && (
                <div className={`user-popup ${!expanded ? "popup-absolute" : ""}`} ref={popupRef}>
                    <div className="popup-item" onClick={handleSettings}>
                        <Settings size={16} />
                        <span>Settings</span>
                    </div>
                    <div className="popup-item" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserButton;