import { axiosInstance } from './axiosInstance';
import type { User } from '../types';

export interface BlockUserResponse {
  id: number;
  username: string;
  isActive: boolean;
}

export const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await axiosInstance.get<User[]>('/admin/users');
    return data;
  },

  blockUser: async (id: number): Promise<BlockUserResponse> => {
    const { data } = await axiosInstance.patch<BlockUserResponse>(`/admin/users/${id}/block`);
    return data;
  },

  unblockUser: async (id: number): Promise<BlockUserResponse> => {
    const { data } = await axiosInstance.patch<BlockUserResponse>(`/admin/users/${id}/unblock`);
    return data;
  },
};
