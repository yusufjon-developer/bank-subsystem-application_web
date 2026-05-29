export type Role = 'ROLE_CLIENT' | 'ROLE_OPERATOR' | 'ROLE_ADMIN';

export interface User {
  id: number;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CURRENCY';
export type Currency = 'TJS' | 'USD' | 'EUR' | 'RUB';
export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'CLOSED';

export interface Account {
  id: number;
  accountNumber: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  status: AccountStatus;
  createdAt: string;
}

export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE' | 'FEE';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: number;
  fromAccountNumber: string | null;
  toAccountNumber: string | null;
  amount: number;
  fee: number;
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  createdAt: string;
}

export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
