import React, {useEffect, useState} from 'react';
import {CheckCircle, AlertTriangle, X} from 'lucide-react';
import '../styles/toast.scss';

function Toast({message, type = 'success', onClose, duration = 3000}) {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration]);

    return (<div className={`toast-notification ${type} ${isExiting ? 'exiting' : ''}`}
                 style={isExiting ? {animation: 'toast-slide-out 0.3s forwards'} : {animation: 'toast-slide-in 0.3s forwards'}}>
            <div className="toast-icon">
                {type === 'success' && <CheckCircle size={20}/>}
                {type === 'error' && <AlertTriangle size={20}/>}
            </div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={handleClose}>
                <X size={16}/>
            </button>
        </div>);
}

export default Toast;
