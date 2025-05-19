import { useUser } from "../contexts/UserContext";

export default function useUserData() {
    const { user } = useUser();
    return user;
}
