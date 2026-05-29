import React, { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from '@nextui-org/react';
import { accountApi } from '../../api/accountApi';
import { transactionApi } from '../../api/transactionApi';
import type { Account, Transaction } from '../../types';
import { CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountApi.getAccounts();
        setAccounts(data);
        if (data.length > 0) {
          setSelectedAccount(data[0]);
        }
      } catch (err) {
        console.error('Failed to load accounts', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;
    
    const fetchTransactions = async () => {
      try {
        const txPage = await transactionApi.getHistory(selectedAccount.id, page, 10);
        const newTxs = txPage.content;
        
        if (page === 0) {
          setTransactions(newTxs);
        } else {
          setTransactions(prev => [...prev, ...newTxs]);
        }
        setHasMore(!txPage.last);
      } catch (err) {
        console.error('Failed to load transactions', err);
      }
    };
    fetchTransactions();
  }, [selectedAccount, page]);

  const handleAccountSelect = (acc: Account) => {
    if (acc.id !== selectedAccount?.id) {
      setSelectedAccount(acc);
      setPage(0);
      setTransactions([]);
    }
  };

  const getTxTypeLabel = (type: string) => {
    switch (type) {
      case 'TRANSFER': return 'Перевод';
      case 'DEPOSIT': return 'Внесение';
      case 'WITHDRAWAL': return 'Снятие';
      case 'EXCHANGE': return 'Обмен';
      case 'FEE': return 'Комиссия';
      default: return type;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <CreditCard size={24} />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Мои счета</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="col-span-1 flex flex-col gap-4">
          {accounts.map(acc => (
            <Card 
              key={acc.id} 
              isPressable 
              onPress={() => handleAccountSelect(acc)}
              className={`shadow-soft border-2 transition-all ${selectedAccount?.id === acc.id ? 'border-primary' : 'border-transparent'}`}
            >
              <CardBody className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-default-500 font-mono">{acc.accountNumber}</p>
                    <p className="text-xs text-default-400">Открыт: {new Date(acc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Chip size="sm" color={acc.status === 'ACTIVE' ? 'success' : 'danger'} variant="flat">
                    {acc.status === 'ACTIVE' ? 'Активен' : acc.status === 'BLOCKED' ? 'Блокирован' : 'Закрыт'}
                  </Chip>
                </div>
                <h3 className="text-2xl font-bold">{acc.balance.toLocaleString()} {acc.currency}</h3>
              </CardBody>
            </Card>
          ))}
          {accounts.length === 0 && (
            <div className="text-default-500">У вас нет открытых счетов.</div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="col-span-1 lg:col-span-2">
          {selectedAccount ? (
            <Card className="shadow-soft">
              <CardBody className="p-0">
                <div className="p-6 border-b border-default-200">
                  <h2 className="text-xl font-bold">История транзакций</h2>
                  <p className="text-default-500 text-sm">Счет: {selectedAccount.accountNumber}</p>
                </div>
                <Table aria-label="Transaction history" removeWrapper>
                  <TableHeader>
                    <TableColumn>ТИП</TableColumn>
                    <TableColumn>ДАТА</TableColumn>
                    <TableColumn>ДЕТАЛИ</TableColumn>
                    <TableColumn align="end">СУММА</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="По этому счету транзакций не найдено.">
                    {transactions.map((tx) => {
                      const isOut = tx.type === 'WITHDRAWAL' || tx.type === 'FEE' || (tx.type === 'TRANSFER' && tx.fromAccountNumber === selectedAccount.accountNumber);
                      return (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <Chip size="sm" variant="flat" color={isOut ? "danger" : "success"}>
                              {getTxTypeLabel(tx.type)}
                            </Chip>
                          </TableCell>
                          <TableCell className="text-default-500">
                            {new Date(tx.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {tx.type === 'TRANSFER' ? (
                              isOut 
                                ? `Получатель: ...${tx.toAccountNumber?.substring(12) || ''}` 
                                : `Отправитель: ...${tx.fromAccountNumber?.substring(12) || ''}`
                            ) : tx.description || '-'}
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center justify-end gap-1 font-bold ${isOut ? 'text-danger' : 'text-success'}`}>
                              {isOut ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                              {isOut ? '-' : '+'}{tx.amount.toLocaleString()} {tx.currency}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {hasMore && (
                  <div className="p-4 border-t border-default-200 flex justify-center">
                    <Button variant="flat" size="sm" onPress={() => setPage(p => p + 1)}>
                      Загрузить еще
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full text-default-500 bg-content1 rounded-2xl border border-dashed border-default-300 min-h-[300px]">
              Выберите счет для просмотра истории
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
