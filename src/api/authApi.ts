import { axiosInstance } from './axiosInstance';
import type { Role } from '../types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  role: Role;
  userId: number;
  expiresIn: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  passportSeries: string;
  passportNumber: string;
  phone?: string;
  email?: string;
  role?: Role;
}

export interface RegisterResponse {
  id: number;
  username: string;
  role: Role;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponseDto> => {
    const { data } = await axiosInstance.post<AuthResponseDto>('/auth/login', credentials);
    return data;
  },
  registerClient: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await axiosInstance.post<RegisterResponse>('/auth/register', data);
    return res.data;
  }
};
