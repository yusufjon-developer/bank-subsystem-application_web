import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardBody, Button, Skeleton } from '@nextui-org/react';
import { accountApi } from '../../api/accountApi';
import { transactionApi } from '../../api/transactionApi';
import type { Account, Transaction } from '../../types';
import { Plus, Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accData = await accountApi.getAccounts();
        setAccounts(accData);
        
        if (accData.length > 0) {
          const txPage = await transactionApi.getHistory(accData[0].id, 0, 10);
          setTransactions(txPage.content);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  const chartData = useMemo(() => {
    const activeAccount = accounts[0];
    if (!activeAccount) return [{ date: 'Сегодня', balance: 0 }];

    let balanceAfter = activeAccount.balance;
    const points = transactions.map(tx => {
      const isOut = tx.fromAccountNumber === activeAccount.accountNumber;
      const delta = isOut ? -tx.amount : tx.amount;
      const point = {
        date: new Date(tx.createdAt).toLocaleDateString(),
        balance: balanceAfter,
      };
      balanceAfter -= delta;
      return point;
    });
    points.reverse();
    return points.length ? points : [{ date: 'Сегодня', balance: activeAccount.balance }];
  }, [transactions, accounts]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl col-span-1" />
          <Skeleton className="h-[200px] rounded-2xl col-span-1 md:col-span-2" />
        </div>
        <Skeleton className="h-8 w-40 rounded-lg mt-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Панель управления</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <Card className="col-span-1 bg-primary text-primary-foreground">
          <CardBody className="flex flex-col gap-2 justify-center p-6">
            <div className="flex items-center gap-2 opacity-80 mb-1">
              <Wallet size={20} />
              <p className="text-sm font-medium">Общий баланс</p>
            </div>
            <h2 className="text-4xl font-bold">{totalBalance.toLocaleString()} {accounts[0]?.currency || 'TJS'}</h2>
          </CardBody>
        </Card>

        {/* Mini Chart */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="px-6 pt-6 pb-0">
            <p className="font-semibold text-foreground">История баланса ({accounts[0]?.currency || 'TJS'})</p>
          </CardHeader>
          <CardBody className="px-6 py-4">
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString()} ${accounts[0]?.currency || 'TJS'}`, 'Баланс']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Line type="monotone" dataKey="balance" stroke="#059669" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Accounts List */}
      <h2 className="text-xl font-bold mt-4">Ваши счета</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => (
          <Card key={account.id} isPressable onPress={() => {}}>
            <CardBody className="flex flex-col gap-3 p-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-default-500 font-mono">{account.accountNumber}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${account.status === 'ACTIVE' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                  {account.status === 'ACTIVE' ? 'Активен' : account.status === 'BLOCKED' ? 'Заблокирован' : 'Закрыт'}
                </span>
              </div>
              <h3 className="text-2xl font-bold">{account.balance.toLocaleString()} {account.currency}</h3>
            </CardBody>
          </Card>
        ))}
        {accounts.length === 0 && (
          <p className="text-default-500 col-span-full">Счета не найдены. Обратитесь к сотруднику банка для открытия счета.</p>
        )}
      </div>
      <Button 
        color="primary" 
        size="lg"
        className="fixed bottom-8 right-8 rounded-full shadow-lg h-16 w-16 px-0 min-w-0 flex items-center justify-center z-50"
        onPress={() => {}}
        aria-label="New Account"
      >
        <Plus size={28} />
      </Button>
    </div>
  );
};
