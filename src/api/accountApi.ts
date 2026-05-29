import { axiosInstance } from './axiosInstance';
import type { Account, Currency, AccountType } from '../types';

export interface CreateAccountRequest {
  clientId: number;
  currency: Currency;
  type: AccountType;
}

export const accountApi = {
  getAccounts: async (): Promise<Account[]> => {
    const { data } = await axiosInstance.get<Account[]>('/accounts');
    return data;
  },

  getAccountDetails: async (accountNumber: string): Promise<Account> => {
    const { data } = await axiosInstance.get<Account>(`/accounts/${accountNumber}`);
    return data;
  },

  createAccount: async (requestData: CreateAccountRequest): Promise<Account> => {
    const { data } = await axiosInstance.post<Account>('/accounts', requestData);
    return data;
  },

  blockAccount: async (accountNumber: string): Promise<Account> => {
    const { data } = await axiosInstance.patch<Account>(`/accounts/${accountNumber}/block`);
    return data;
  },

  closeAccount: async (accountNumber: string): Promise<Account> => {
    const { data } = await axiosInstance.patch<Account>(`/accounts/${accountNumber}/close`);
    return data;
  },
};
