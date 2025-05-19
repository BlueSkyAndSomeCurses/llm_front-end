import { useState } from "react";
import axios from "axios";

function ProfileSectionContainer({ user, updateUser }) {
    const [name, setName] = useState(user?.name || "");
    const [errors, setErrors] = useState({});

    const validateName = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const updateProfile = async () => {
        if (!validateName()) {
            return { success: false };
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put("/api/user/profile", { name: name.trim() }, { headers: { Authorization: `Bearer ${token}` } });

            if (response.data.user) {
                localStorage.setItem("user", JSON.stringify(response.data.user));

                const userDataChangedEvent = new CustomEvent('userDataChanged', {
                    detail: { user: response.data.user }
                });
                window.dispatchEvent(userDataChangedEvent);

                if (typeof updateUser === 'function') {
                    updateUser(response.data.user);
                }
            }

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }

            return { success: true };
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrors({
                submit: "Failed to update profile. Please try again."
            });
            return { success: false };
        }
    };

    return {
        name, setName, errors, validateName, updateProfile, render: () => (<div className="form-group">
            <label htmlFor="name">Name</label>
            <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
            />
            {errors.name && <span className="error">{errors.name}</span>}
        </div>)
    };
}

export default ProfileSectionContainer;
