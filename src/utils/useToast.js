import { useToast as useToastContext } from '../contexts/ToastContext.jsx';

const useToast = () => {
    const { showToast } = useToastContext();

    const success = (message, duration = 3000) => {
        showToast(message, 'success', duration);
    };

    const error = (message, duration = 3000) => {
        showToast(message, 'error', duration);
    };

    return {
        success,
        error
    };
};

export default useToast;
