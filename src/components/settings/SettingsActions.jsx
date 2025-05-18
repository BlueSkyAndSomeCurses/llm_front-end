import {Save} from "lucide-react";

const SettingsActions = ({onClose, loading}) => {
    return (
        <div className="settings-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
            </button>
            <button type="submit" className="save-button" disabled={loading}>
                <Save size={16}/>
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
};

export default SettingsActions;
