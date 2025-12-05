// src/types/user.types.ts

export interface User {
  _id: string;
  name: string;
  gmail: string;
  age: number;
  address: string;
}

export interface CreateUserDto {
  name: string;
  gmail: string;
  password: string;
  age: number;
  address: string;
}

export interface UpdateUserDto {
  name?: string;
  gmail?: string;
  age?: number;
  address?: string;
}

export interface LoginDto {
  gmail: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  gmail: string;
  password: string;
  age: number;
  address: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    gmail: string;
    age: number;
    address: string;
  };
}

export interface UsersResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}

export interface ErrorResponse {
  message?: string;
  error?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}