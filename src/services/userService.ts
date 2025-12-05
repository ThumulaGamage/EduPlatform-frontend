// src/services/userService.ts
import API from '../api/axios';
import { User, CreateUserDto, ApiResponse } from '../types/user.types';
import { AxiosResponse } from 'axios';

export const userService = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response: AxiosResponse<ApiResponse<User[]>> = await API.get('/users');
    return response.data.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await API.get(`/users/${id}`);
    return response.data.data;
  },

  // Create user
  create: async (userData: CreateUserDto): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await API.post('/users', userData);
    return response.data.data;
  },

  // Update user
  update: async (id: string, userData: Partial<CreateUserDto>): Promise<User> => {
    const response: AxiosResponse<ApiResponse<User>> = await API.put(`/users/${id}`, userData);
    return response.data.data;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await API.delete(`/users/${id}`);
  },
};