// Global error handler for production
export const handleAPIError = (error, context = '') => {
  console.error(`API Error ${context}:`, error);
  
  // Log to external service in production
  if (import.meta.env.PROD) {
    // You can integrate with services like Sentry, LogRocket, etc.
    // logToExternalService(error, context);
  }
  
  // Return user-friendly error message
  if (error.message?.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error.message?.includes('401')) {
    return 'Authentication required. Please log in again.';
  }
  
  if (error.message?.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.message?.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (error.message?.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Network status checker
export const checkNetworkStatus = () => {
  return navigator.onLine;
};

// Service worker registration for offline support
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};