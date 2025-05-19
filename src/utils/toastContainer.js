import { useToast } from '../contexts/ToastContext';

export const useToastNotifier = () => {
    const { showToast } = useToast();
    
    return {
        showToast
    };
};
