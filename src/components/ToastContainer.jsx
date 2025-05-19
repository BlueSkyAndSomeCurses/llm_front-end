import React from 'react';
import ReactDOM from 'react-dom';
import Toast from './Toast';
import '../styles/toastContainer.scss';
import { useToast } from '../contexts/ToastContext.jsx';

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return ReactDOM.createPortal(
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>,
        document.body
    );
}

export default ToastContainer;
