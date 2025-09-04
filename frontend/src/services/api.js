const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    return await retryRequest(async () => {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      return await handleResponse(response);
    });
  } catch (error) {
    const friendlyError = handleAPIError(error, endpoint);
    throw new Error(friendlyError);
  }
};

// Authentication APIs
export const authAPI = {
  signup: (userData) => apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  googleAuth: (idToken) => apiRequest('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  }),
  
  forgotPassword: (email) => apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  resetPassword: (token, newPassword) => apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  }),
  
  getProfile: () => apiRequest('/api/auth/profile'),
  
  updateProfile: (profileData) => {
    console.log('API: Updating profile with data:', profileData);
    return apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  logout: () => apiRequest('/api/auth/logout', {
    method: 'POST',
  }),
};

// Events APIs
export const eventsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/events${queryString ? `?${queryString}` : ''}`);
  },
  
  getMyEvents: () => apiRequest('/api/events/my/events'),
  
  create: (formData) => {
    const token = getAuthToken();
    return fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(handleResponse);
  },
  
  getById: (id) => apiRequest(`/api/events/${id}`),
  
  update: (id, eventData) => apiRequest(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  }),
  
  delete: (id) => apiRequest(`/api/events/${id}`, {
    method: 'DELETE',
  }),
  
  getCategories: () => apiRequest('/api/events/categories'),
  
  getVenues: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/events/venues${queryString ? `?${queryString}` : ''}`);
  },
  
  getVenueById: (id) => apiRequest(`/api/events/venues/${id}`),
};

// Bookings APIs
export const bookingsAPI = {
  create: (bookingData) => apiRequest('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),
  
  getUserBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/bookings${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/api/bookings/${id}`),
  
  updateStatus: (id, statusData) => apiRequest(`/api/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  }),
  
  cancel: (id) => apiRequest(`/api/bookings/${id}`, {
    method: 'DELETE',
  }),
  
  getAvailableSeats: (eventId) => apiRequest(`/api/bookings/seats/${eventId}`),
  
  getStats: () => apiRequest('/api/bookings/stats/summary'),
};

// Health check
export const healthCheck = () => apiRequest('/health');

export default {
  auth: authAPI,
  events: eventsAPI,
  bookings: bookingsAPI,
  health: healthCheck,
};
import { handleAPIError, retryRequest } from '../utils/errorHandler.js';
