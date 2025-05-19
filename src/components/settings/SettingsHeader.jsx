import {X} from "lucide-react";

const SettingsHeader = ({onClose, title = "User Settings"}) => {
    return (<div className="settings-header">
            <h2>{title}</h2>
            <button className="close-button" onClick={onClose}>
                <X size={24}/>
            </button>
        </div>);
};

export default SettingsHeader;
