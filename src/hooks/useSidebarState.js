import {useState} from "react";

export default function useSidebarState() {
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    const handleSidebarStateChange = (isExpanded) => {
        setSidebarExpanded(isExpanded);
    };

    return {sidebarExpanded, handleSidebarStateChange};
}
