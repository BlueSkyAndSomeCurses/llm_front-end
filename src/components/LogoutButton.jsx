import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./sidebar.scss";

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login page
        navigate("/login");
    };

    return (
        <button className="sidebar-icon" onClick={handleLogout}>
            <LogOut size={30} />
        </button>
    );
}

export default LogoutButton;
