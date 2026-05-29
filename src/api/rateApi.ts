import { axiosInstance } from './axiosInstance';

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

export interface UpdateRateRequest {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

export const rateApi = {
  getRates: async (): Promise<ExchangeRate[]> => {
    // According to API_DOCS.md this is a public endpoint
    const { data } = await axiosInstance.get<ExchangeRate[]>('/rates');
    return data;
  },

  updateRate: async (data: UpdateRateRequest): Promise<void> => {
    await axiosInstance.post('/rates', data);
  },
};
