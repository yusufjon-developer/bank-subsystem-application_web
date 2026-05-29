import { axiosInstance } from './axiosInstance';
import type { Transaction, SpringPage, TransactionType } from '../types';

export interface TransferRequest {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
}

export interface CashRequest {
  accountNumber: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
}

export const transactionApi = {
  transfer: async (request: TransferRequest): Promise<Transaction> => {
    const { data } = await axiosInstance.post<Transaction>('/transactions/transfer', request);
    return data;
  },

  cashOperation: async (request: CashRequest): Promise<Transaction> => {
    const { data } = await axiosInstance.post<Transaction>('/transactions/cash', request);
    return data;
  },

  getHistory: async (
    accountId: number,
    page: number = 0,
    size: number = 20,
    type?: TransactionType,
    from?: string,
    to?: string
  ): Promise<SpringPage<Transaction>> => {
    const params: Record<string, any> = { accountId, page, size };
    if (type) params.type = type;
    if (from) params.from = from;
    if (to) params.to = to;
    
    const { data } = await axiosInstance.get<SpringPage<Transaction>>('/transactions/history', { params });
    return data;
  },
};
