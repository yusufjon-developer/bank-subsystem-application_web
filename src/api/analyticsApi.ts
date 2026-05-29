import { axiosInstance } from './axiosInstance';

export interface BalanceDynamicsPoint {
  date: string;
  balance: number;
}

export interface BalanceDynamicsResponse {
  accountId: number;
  currency: string;
  data: BalanceDynamicsPoint[];
}

export interface AnalyticsSummary {
  clientId: number;
  totalIncome: number;
  totalExpense: number;
  totalTransactions: number;
  averageTransactionAmount: number;
}

export const analyticsApi = {
  getBalanceDynamics: async (
    accountId: number,
    from?: string,
    to?: string
  ): Promise<BalanceDynamicsResponse> => {
    const params: Record<string, any> = { accountId };
    if (from) params.from = from;
    if (to) params.to = to;
    
    const { data } = await axiosInstance.get<BalanceDynamicsResponse>('/analytics/balance-dynamics', { params });
    return data;
  },

  getSummary: async (from?: string, to?: string): Promise<AnalyticsSummary> => {
    const params: Record<string, any> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    
    const { data } = await axiosInstance.get<AnalyticsSummary>('/analytics/summary', { params });
    return data;
  },
};
