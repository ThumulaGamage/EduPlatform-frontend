// src/services/authService.ts
import API from '../api/axios';
import { LoginDto, RegisterDto, AuthResponse } from '../types/user.types';
import { AxiosResponse } from 'axios';

export const authService = {
  // Register new user
  register: async (userData: RegisterDto): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await API.post('/auth/register', userData);
    
    // Save token and user data to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Login user
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await API.post('/auth/login', credentials);
    
    // Save token and user data to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  }
};