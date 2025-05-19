export const debounce = (func, wait = 300, immediate = false) => {
    let timeout;

    return function executedFunction(...args) {
        const context = this;

        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};

export const throttle = (func, wait = 300) => {
    let inThrottle, lastFunc, lastTime;

    return function executedFunction(...args) {
        const context = this;

        if (!inThrottle) {
            func.apply(context, args);
            lastTime = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFunc);

            lastFunc = setTimeout(function () {
                if (Date.now() - lastTime >= wait) {
                    func.apply(context, args);
                    lastTime = Date.now();
                }
            }, Math.max(wait - (Date.now() - lastTime), 0));
        }
    };
};

export const once = (func) => {
    let ran = false;
    let result;

    return function executedFunction(...args) {
        if (ran) return result;

        ran = true;
        result = func.apply(this, args);
        return result;
    };
};

export const safeStorage = {
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error getting item ${key} from localStorage:`, error);
            return defaultValue;
        }
    }, setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting item ${key} in localStorage:`, error);
            return false;
        }
    }, removeItem(key) {
        try {
            localStorage.setItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing item ${key} from localStorage:`, error);
            return false;
        }
    }
};

export const withRetry = async (fn, {retries = 3, delay = 300, shouldRetry = () => true} = {}) => {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt < retries && shouldRetry(error)) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                break;
            }
        }
    }

    throw lastError;
};
