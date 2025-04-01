import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.scss";

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <button className="sidebar-icon" onClick={handleLogout}>
            <LogOut size={30} />
        </button>
    );
}

export default LogoutButton;
