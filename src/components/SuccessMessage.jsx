import { CheckCircle } from "lucide-react";

function SuccessMessage({ message }) {
    if (!message) return null;

    return (
        <span className="success-message">
            <CheckCircle size={16} />
            {message}
        </span>
    );
}

export default SuccessMessage;
