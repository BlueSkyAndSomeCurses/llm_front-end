import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import Toast from './Toast';
import '../styles/toastContainer.scss';
import {showToast} from '../utils/toastContainer.js';

function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleToast = (event) => {
            if (event.detail) {
                const {message, type = 'success', duration = 3000} = event.detail;
                const id = Date.now().toString();

                setToasts((prevToasts) => [
                    ...prevToasts,
                    {id, message, type, duration}
                ]);
            }
        };

        window.addEventListener('showToast', handleToast);

        return () => {
            window.removeEventListener('showToast', handleToast);
        };
    }, []);

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
    };

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

export {showToast};

export default ToastContainer;
