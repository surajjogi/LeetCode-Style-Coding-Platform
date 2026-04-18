
// utils/errorHandler.js
export const serializeAxiosError = (error) => {
  // If it's an Axios error with response from backend
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || 
               error.response.data?.error || 
               error.response.data?.msg ||
               getDefaultMessageForStatus(error.response.status),
      data: error.response.data,
      timestamp: new Date().toISOString()
    };
  }
  
  // Network error (no response)
  if (error.request) {
    return {
      status: 503, // Service Unavailable
      message: 'Cannot connect to server. Please check your internet connection.',
      data: null,
      timestamp: new Date().toISOString()
    };
  }
  
  // Something else went wrong
  return {
    status: 500,
    message: error.message || 'An unexpected error occurred',
    data: null,
    timestamp: new Date().toISOString()
  };
};

// Helper function for default messages
const getDefaultMessageForStatus = (status) => {
  switch (status) {
    case 400: return 'Bad request. Please check your input.';
    case 401: return 'You are not authorized. Please log in.';
    case 403: return 'You don\'t have permission to do this.';
    case 404: return 'Resource not found.';
    case 409: return 'Conflict with existing data.';
    case 422: return 'Validation failed. Please check your input.';
    case 500: return 'Server error. Please try again later.';
    default: return `Request failed with status ${status}`;
  }
};