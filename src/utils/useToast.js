import { showToast } from './ToastContainer';

const useToast = () => {
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
