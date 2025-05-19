import {LogOut} from "lucide-react";
import {useNavigate} from "react-router-dom";
import "../styles/sidebar.scss";
import axios from "axios";

function LogoutButton() {
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await axios.post("/api/logout");
        } catch (error) {
            console.error("Error logging out:", error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (<button className="sidebar-icon" onClick={handleLogout}>
            <LogOut size={30}/>
        </button>);
}

export default LogoutButton;
