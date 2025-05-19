import {useState, useEffect} from "react";
import "../styles/usersettings.scss";
import axios from "axios";
import useToast from "../utils/useToast";
import {
    SettingsHeader,
    AvatarSection as AvatarSectionView,
    ProfileSection as ProfileSectionView,
    PasswordSection as PasswordSectionView,
    SettingsActions
} from "./settings";

function UserSettings({onClose, user}) {
    const [name, setName] = useState(user?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const toast = useToast();

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
        const scrollY = window.scrollY;

        document.body.style.setProperty('--scroll-position', `-${scrollY}px`);

        document.body.classList.add('no-scroll');

        return () => {
            document.body.classList.remove('no-scroll');
            window.scrollTo(0, scrollY);
        };
    }, []);
    const validateForm = () => {
        const currentName = name;
        const currentNewPassword = newPassword;
        const currentConfirmPassword = confirmPassword;

        console.log(currentName, currentNewPassword, currentConfirmPassword, currentPassword);
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
                {name: currentName},
                {headers: {Authorization: `Bearer ${token}`}}
            );

            if (response.data.user) {
                localStorage.setItem("user", JSON.stringify(response.data.user));

                const userDataChangedEvent = new CustomEvent('userDataChanged', {
                    detail: {user: response.data.user}
                });
                window.dispatchEvent(userDataChangedEvent);
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
                {headers: {Authorization: `Bearer ${token}`}}
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
                    toast.success("Settings updated successfully!");
                }
            } catch (error) {
                console.error("Error updating user:", error);
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    submit: "An error occurred while saving your settings"
                }));
                toast.error("Failed to update settings");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="settings-overlay">
            <div className="settings-modal">
                <SettingsHeader onClose={onClose}/>

                <form onSubmit={handleSubmit}>
                    <AvatarSectionView
                        user={user}
                        errors={errors}
                        setErrors={setErrors}
                    />

                    <ProfileSectionView
                        name={name}
                        setName={setName}
                        errors={errors}
                    />

                    <PasswordSectionView
                        currentPassword={currentPassword}
                        setCurrentPassword={setCurrentPassword}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        errors={errors}
                    />

                    {errors.submit && <div className="error-message">{errors.submit}</div>}

                    <SettingsActions
                        onClose={onClose}
                        loading={loading}
                    />
                </form>
            </div>
        </div>
    );
};

export default UserSettings;