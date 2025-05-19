import {useNavigate} from "react-router-dom";
import "../styles/logo.scss";

function Logo() {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate("/");
    };

    return (<span className="logo" onClick={handleLogoClick} role="button">
            FC Slavuta
        </span>);
}

export default Logo;
