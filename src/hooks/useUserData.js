import {useState, useEffect} from "react";

export default function useUserData() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const handleUserDataChanged = (event) => {
            if (event.detail && event.detail.user) {
                setUser(event.detail.user);
            }
        };

        window.addEventListener('userDataChanged', handleUserDataChanged);

        return () => {
            window.removeEventListener('userDataChanged', handleUserDataChanged);
        };
    }, []);

    return user;
}
