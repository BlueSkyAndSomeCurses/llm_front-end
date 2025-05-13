/**
 * Utility functions for handling race conditions and concurrent operations
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - Whether to invoke the function on the leading edge instead of trailing
 * @returns {Function} The debounced function
 */
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

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every wait milliseconds
 * 
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to wait between invocations
 * @returns {Function} The throttled function
 */
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
      
      lastFunc = setTimeout(function() {
        if (Date.now() - lastTime >= wait) {
          func.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

/**
 * Creates a function that executes once and memoizes the result
 * 
 * @param {Function} func - The function to be executed once
 * @returns {Function} A function that will call the original function only once
 */
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

/**
 * Safe wrapper for LocalStorage operations to handle exceptions
 */
export const safeStorage = {
  /**
   * Safely get an item from localStorage
   * 
   * @param {string} key - The key to retrieve
   * @param {*} defaultValue - Default value if retrieval fails
   * @returns {*} The retrieved value or defaultValue
   */
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  
  /**
   * Safely set an item in localStorage
   * 
   * @param {string} key - The key to set
   * @param {*} value - The value to store
   * @returns {boolean} Whether the operation succeeded
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
      return false;
    }
  },
  
  /**
   * Safely remove an item from localStorage
   * 
   * @param {string} key - The key to remove
   * @returns {boolean} Whether the operation succeeded
   */
  removeItem(key) {
    try {
      localStorage.setItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
      return false;
    }
  }
};

/**
 * Execute a function with an automatic retry mechanism
 * 
 * @param {Function} fn - The async function to execute
 * @param {Object} options - Configuration options
 * @param {number} options.retries - Maximum number of retries
 * @param {number} options.delay - Delay between retries in ms
 * @param {Function} options.shouldRetry - Function that decides if another retry should be attempted
 * @returns {Promise} The result of the function
 */
export const withRetry = async (fn, { retries = 3, delay = 300, shouldRetry = () => true } = {}) => {
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
