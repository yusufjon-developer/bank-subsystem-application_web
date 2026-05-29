import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardBody, Spinner, Select, SelectItem } from '@nextui-org/react';
import { analyticsApi } from '../../api/analyticsApi';
import type { BalanceDynamicsPoint, AnalyticsSummary } from '../../api/analyticsApi';
import { accountApi } from '../../api/accountApi';
import type { Account } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart2, TrendingUp, Calendar, CreditCard, Activity } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [dynamics, setDynamics] = useState<BalanceDynamicsPoint[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDynamics, setIsLoadingDynamics] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const accs = await accountApi.getAccounts();
        setAccounts(accs);
        
        if (accs.length > 0) {
          const firstAccId = accs[0].id;
          setSelectedAccountId(firstAccId.toString());
          
          const [dynResponse, sumData] = await Promise.all([
            analyticsApi.getBalanceDynamics(firstAccId),
            analyticsApi.getSummary()
          ]);
          
          setDynamics(dynResponse.data);
          setSummary(sumData);
        }
      } catch (err) {
        console.error('Failed to load initial analytics data', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Fetch dynamics when selected account changes
  useEffect(() => {
    if (!selectedAccountId) return;
    
    const fetchDynamics = async () => {
      setIsLoadingDynamics(true);
      try {
        const dynResponse = await analyticsApi.getBalanceDynamics(Number(selectedAccountId));
        setDynamics(dynResponse.data);
      } catch (err) {
        console.error('Failed to load balance dynamics', err);
      } finally {
        setIsLoadingDynamics(false);
      }
    };
    
    fetchDynamics();
  }, [selectedAccountId]);



  const pieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Доходы', value: summary.totalIncome, color: '#17c964' },
      { name: 'Расходы', value: summary.totalExpense, color: '#f31260' },
    ].filter(item => item.value > 0);
  }, [summary]);

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <BarChart2 size={24} />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Аналитика</h1>
      </div>

      {accounts.length > 0 ? (
        <>
          {/* Summary Stats Grid */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-success/10 text-success border border-success/20">
                <CardBody className="p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 opacity-80 mb-1">
                    <TrendingUp size={16} />
                    <p className="text-xs font-semibold">Общий доход</p>
                  </div>
                  <h3 className="text-2xl font-bold">${summary.totalIncome.toLocaleString()}</h3>
                </CardBody>
              </Card>

              <Card className="bg-danger/10 text-danger border border-danger/20">
                <CardBody className="p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 opacity-80 mb-1">
                    <TrendingUp size={16} className="rotate-180" />
                    <p className="text-xs font-semibold">Общие расходы</p>
                  </div>
                  <h3 className="text-2xl font-bold">${summary.totalExpense.toLocaleString()}</h3>
                </CardBody>
              </Card>

              <Card className="bg-info/10 text-info border border-info/20">
                <CardBody className="p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 opacity-80 mb-1">
                    <Activity size={16} />
                    <p className="text-xs font-semibold">Всего транзакций</p>
                  </div>
                  <h3 className="text-2xl font-bold">{summary.totalTransactions}</h3>
                </CardBody>
              </Card>

              <Card className="bg-warning/10 text-warning border border-warning/20">
                <CardBody className="p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 opacity-80 mb-1">
                    <Calendar size={16} />
                    <p className="text-xs font-semibold">Средняя операция</p>
                  </div>
                  <h3 className="text-2xl font-bold">${summary.averageTransactionAmount.toLocaleString()}</h3>
                </CardBody>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance Dynamics Chart */}
            <Card className="col-span-1 lg:col-span-2 shadow-soft">
              <CardHeader className="px-6 pt-6 pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold">Динамика баланса</h2>
                <Select
                  size="sm"
                  className="max-w-[240px]"
                  label="Выберите счет"
                  selectedKeys={selectedAccountId ? [selectedAccountId] : []}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  startContent={<CreditCard size={16} className="text-default-400" />}
                >
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} textValue={acc.accountNumber}>
                      <span className="font-mono text-xs">{acc.accountNumber} ({acc.currency})</span>
                    </SelectItem>
                  ))}
                </Select>
              </CardHeader>
              <CardBody className="px-6 py-4 flex justify-center items-center">
                {isLoadingDynamics ? (
                  <div className="h-[300px] flex items-center justify-center"><Spinner /></div>
                ) : (
                  <div className="h-[300px] w-full mt-4">
                    {dynamics.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dynamics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                          <Tooltip 
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Баланс']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                          />
                          <Line type="monotone" dataKey="balance" stroke="#006FEE" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-default-400">
                        Для этого счета транзакций не найдено.
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Income/Expense Summary */}
            <Card className="col-span-1 shadow-soft">
              <CardHeader className="px-6 pt-6 pb-0">
                <h2 className="text-xl font-bold">Доходы и расходы</h2>
              </CardHeader>
              <CardBody className="px-6 py-4">
                <div className="h-[300px] w-full flex justify-center items-center">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-default-400">
                      Данные о доходах/расходах отсутствуют.
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      ) : (
        <Card className="shadow-soft min-h-[300px] flex items-center justify-center">
          <CardBody className="flex items-center justify-center text-default-500">
            Счета не найдены. Пожалуйста, откройте счет для отображения аналитики.
          </CardBody>
        </Card>
      )}
    </div>
  );
};
