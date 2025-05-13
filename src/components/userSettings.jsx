import { useState, useRef, useEffect } from "react";
import { X, Upload, Save, Trash2, CheckCircle } from "lucide-react";
import "../styles/usersettings.scss";
import axios from "axios";

function UserSettings({ onClose, user }) {
    const [name, setName] = useState(user?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const successTimerRef = useRef(null);

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

    useEffect(() => {
        return () => {
            if (successTimerRef.current) {
                clearTimeout(successTimerRef.current);
            }
        };
    }, []);

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 2 * 1024 * 1024) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    avatar: "Image size should be less than 2MB"
                }));
                return;
            }

            setAvatar(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target.result;
                setAvatarPreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResetAvatar = () => {
        setAvatar(null);
        setAvatarPreview(null);
    
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.avatar;
            return newErrors;
        });
    };

    const handleAvatarUpload = async () => {
        const currentAvatar = avatar;
        const currentAvatarPreview = avatarPreview;
        
        if (!currentAvatar && !currentAvatarPreview) {
            setErrors((prevErrors) => ({ 
                ...prevErrors, 
                avatar: "No avatar to upload" 
            }));
            return;
        }

        setAvatarLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put("/api/user/profile",
                { avatar: currentAvatarPreview },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            try {
                const currentUser = JSON.parse(localStorage.getItem("user"));
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        avatar: response.data.avatar || currentAvatarPreview
                    };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                }
            } catch (storageError) {
                console.error("Error updating localStorage:", storageError);
            }

            setSuccessMessage("Avatar updated successfully!");
            
            if (successTimerRef.current) {
                clearTimeout(successTimerRef.current);
            }
            
            successTimerRef.current = setTimeout(() => {
                setSuccessMessage("");
                window.location.reload();
            }, 1500);

            setAvatar(null);
            
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors.avatar;
                return newErrors;
            });
        } catch (error) {
            console.error("Error uploading avatar:", error);
            setErrors((prevErrors) => ({ 
                ...prevErrors, 
                avatar: "Failed to upload avatar. Please try again." 
            }));
        } finally {
            setAvatarLoading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const validateForm = () => {
        const currentName = name;
        const currentNewPassword = newPassword;
        const currentConfirmPassword = confirmPassword;
        const currentPassword = currentPassword;
        
        const newErrors = {};

        if (!currentName.trim()) {
            newErrors.name = "Name is required";
        }

        if (currentNewPassword) {
            if (currentNewPassword.length < 8) {
                newErrors.newPassword = "Password must be at least 8 characters";
            }

            if (currentNewPassword !== currentConfirmPassword) {
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
        const currentName = name.trim();
        
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put("/api/user/profile",
                { name: currentName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.user) {
                localStorage.setItem("user", JSON.stringify(response.data.user));
            }

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }

            return true;
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrors((prevErrors) => ({ 
                ...prevErrors, 
                submit: "Failed to update profile. Please try again." 
            }));
            return false;
        }
    };

    const updatePassword = async () => {
        const currentPasswordVal = currentPassword;
        const newPasswordVal = newPassword;
        
        if (!newPasswordVal) return true;

        try {
            const token = localStorage.getItem("token");
            await axios.put("/api/user/password",
                { 
                    currentPassword: currentPasswordVal, 
                    newPassword: newPasswordVal 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return true;
        } catch (error) {
            console.error("Error updating password:", error);
            const errorMessage = error.response?.data?.message || "Failed to update password";
            
            setErrors((prevErrors) => ({ 
                ...prevErrors, 
                currentPassword: errorMessage 
            }));
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
                    setSuccessMessage("Settings updated successfully!");

                    const timeoutId = setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                    successTimerRef.current = timeoutId;
                }
            } catch (error) {
                console.error("Error updating user:", error);
                setErrors((prevErrors) => ({ 
                    ...prevErrors, 
                    submit: "An error occurred while saving your settings" 
                }));
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
                                Select Avatar
                            </button>
                            {avatarPreview && (
                                <>
                                    <button
                                        type="button"
                                        className="save-avatar-button"
                                        onClick={handleAvatarUpload}
                                        disabled={avatarLoading}
                                    >
                                        <Save size={16} />
                                        {avatarLoading ? "Uploading..." : "Upload Avatar"}
                                    </button>

                                    <button
                                        type="button"
                                        className="reset-button"
                                        onClick={handleResetAvatar}
                                        title="Remove avatar"
                                    >
                                        <Trash2 size={16} />
                                        Reset
                                    </button>
                                </>
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
                        {successMessage && (
                            <span className="success-message">
                                <CheckCircle size={16} />
                                {successMessage}
                            </span>
                        )}

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