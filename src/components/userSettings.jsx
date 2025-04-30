import { useState, useRef, useEffect } from "react";
import { X, Upload, Save, Trash2 } from "lucide-react";
import "../styles/usersettings.scss";
import axios from "axios";

function UserSettings({ onClose, user }) {
    const [name, setName] = useState(user?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    // Use the user's existing avatar if available
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscKey);
        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [onClose]);

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 2 * 1024 * 1024) {
                setErrors({ ...errors, avatar: "Image size should be less than 2MB" });
                return;
            }

            setAvatar(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResetAvatar = () => {
        setAvatar(null);
        setAvatarPreview(null);
        const newErrors = { ...errors };
        delete newErrors.avatar;
        setErrors(newErrors);
    };
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        }

        if (newPassword) {
            if (newPassword.length < 8) {
                newErrors.newPassword = "Password must be at least 8 characters";
            }

            if (newPassword !== confirmPassword) {
                newErrors.confirmPassword = "Passwords don't match";
            }

            if (!currentPassword) {
                newErrors.currentPassword = "Current password is required to set a new password";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const updateUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put("/api/user/profile",
                { name, avatar: avatarPreview },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            localStorage.setItem("user", JSON.stringify(response.data.user));

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }

            return true;
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrors({ ...errors, submit: "Failed to update profile. Please try again." });
            return false;
        }
    };

    const updatePassword = async () => {
        if (!newPassword) return true;

        try {
            const token = localStorage.getItem("token");
            await axios.put("/api/user/password",
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return true;
        } catch (error) {
            console.error("Error updating password:", error);
            const errorMessage = error.response?.data?.message || "Failed to update password";
            setErrors({ ...errors, currentPassword: errorMessage });
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);

            try {
                const profileUpdated = await updateUserProfile();

                let passwordUpdated = true;
                if (newPassword) {
                    passwordUpdated = await updatePassword();
                }

                if (profileUpdated && passwordUpdated) {
                    alert("Settings updated successfully!");
                    onClose();
                }
            } catch (error) {
                console.error("Error updating user:", error);
                setErrors({ ...errors, submit: "An error occurred while saving your settings" });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="settings-overlay">
            <div className="settings-modal">
                <div className="settings-header">
                    <h2>User Settings</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="avatar-section">
                        <div className="avatar-preview">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar preview" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}
                        </div>
                        <div className="avatar-buttons">
                            <button type="button" className="upload-button" onClick={triggerFileInput}>
                                <Upload size={16} />
                                Upload Avatar
                            </button>
                            {avatarPreview && (
                                <button
                                    type="button"
                                    className="reset-button"
                                    onClick={handleResetAvatar}
                                    title="Remove avatar"
                                >
                                    <Trash2 size={16} />
                                    Reset
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        {errors.avatar && <span className="error">{errors.avatar}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>

                    <div className="password-section">
                        <h3>Change Password</h3>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                            {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                            {errors.newPassword && <span className="error">{errors.newPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                        </div>
                    </div>

                    {errors.submit && <div className="error-message">{errors.submit}</div>}

                    <div className="settings-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-button" disabled={loading}>
                            <Save size={16} />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserSettings;