import { useState, useRef } from "react";
import { Upload, Save, Trash2 } from "lucide-react";
import axios from "axios";

function AvatarSection({ user, updateUser, onSuccess }) {
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 2 * 1024 * 1024) {
                setErrors({
                    avatar: "Image size should be less than 2MB"
                });
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
            setErrors({ 
                avatar: "No avatar to upload" 
            });
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
                    
                    // Notify parent component about the user update
                    if (typeof updateUser === 'function') {
                        updateUser(updatedUser);
                    }
                }
            } catch (storageError) {
                console.error("Error updating localStorage:", storageError);
            }

            onSuccess("Avatar updated successfully!");
            setAvatar(null);
            
            setErrors({});
        } catch (error) {
            console.error("Error uploading avatar:", error);
            setErrors({ 
                avatar: "Failed to upload avatar. Please try again." 
            });
        } finally {
            setAvatarLoading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
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
        </div>
    );
}

export default AvatarSection;
