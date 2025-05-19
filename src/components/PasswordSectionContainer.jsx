import {useState} from "react";
import axios from "axios";

function PasswordSectionContainer({setParentErrors}) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});

    const validatePasswords = () => {
        const newErrors = {};

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

    const updatePassword = async () => {
        if (!newPassword) return {success: true};

        if (!validatePasswords()) {
            return {success: false};
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put("/api/user/password",
                {
                    currentPassword,
                    newPassword
                },
                {headers: {Authorization: `Bearer ${token}`}}
            );
            return {success: true};
        } catch (error) {
            console.error("Error updating password:", error);
            const errorMessage = error.response?.data?.message || "Failed to update password";

            const newError = {currentPassword: errorMessage};
            setErrors(prev => ({...prev, ...newError}));

            if (setParentErrors) {
                setParentErrors(prev => ({...prev, ...newError}));
            }

            return {success: false};
        }
    };

    const clearForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
    };

    return {
        fields: {
            currentPassword,
            newPassword,
            confirmPassword
        },
        setters: {
            setCurrentPassword,
            setNewPassword,
            setConfirmPassword
        },
        errors,
        validatePasswords,
        updatePassword,
        clearForm,
        render: () => (
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
        )
    };
}

export default PasswordSectionContainer;
