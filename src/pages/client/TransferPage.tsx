import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardBody, Input, Button, Select, SelectItem, Spinner } from '@nextui-org/react';
import { accountApi } from '../../api/accountApi';
import { transactionApi } from '../../api/transactionApi';
import type { Account } from '../../types';
import { Send, DollarSign, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastProvider';

export const TransferPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  
  const [fromAccountNumber, setFromAccountNumber] = useState<string>('');
  const [toAccountNumber, setToAccountNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  
  const [isTransferring, setIsTransferring] = useState(false);
  
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountApi.getAccounts();
        setAccounts(data.filter(acc => acc.status === 'ACTIVE'));
      } catch (err) {
        console.error('Failed to load accounts', err);
        error('Ошибка', 'Не удалось загрузить ваши счета. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, [error]);

  const selectedAccount = useMemo(() => {
    return accounts.find(a => a.accountNumber === fromAccountNumber);
  }, [fromAccountNumber, accounts]);

  const isFormValid = useMemo(() => {
    const numAmount = parseFloat(amount);
    return (
      fromAccountNumber !== '' &&
      toAccountNumber.trim() !== '' &&
      !isNaN(numAmount) &&
      numAmount > 0 &&
      selectedAccount !== undefined &&
      numAmount <= selectedAccount.balance &&
      fromAccountNumber !== toAccountNumber.trim()
    );
  }, [fromAccountNumber, toAccountNumber, amount, selectedAccount]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsTransferring(true);
    try {
      await transactionApi.transfer({
        fromAccountNumber,
        toAccountNumber: toAccountNumber.trim(),
        amount: parseFloat(amount)
      });
      success('Перевод выполнен', `Успешно отправлено ${amount} ${selectedAccount?.currency} на счет ${toAccountNumber}`);
      setFromAccountNumber('');
      setToAccountNumber('');
      setAmount('');
    } catch (err: any) {
      console.error('Transfer failed', err);
      error('Ошибка перевода', err.response?.data?.message || 'Не удалось выполнить перевод. Пожалуйста, проверьте реквизиты.');
    } finally {
      setIsTransferring(false);
    }
  };

  if (isLoadingAccounts) {
    return <div className="flex justify-center mt-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Send size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Перевод средств</h1>
          <p className="text-default-500">Безопасные переводы на любой счет</p>
        </div>
      </div>

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleTransfer} className="flex flex-col gap-6">
            <Select
              label="Счет списания"
              placeholder="Выберите счет списания"
              variant="bordered"
              selectedKeys={fromAccountNumber ? [fromAccountNumber] : []}
              onChange={(e) => setFromAccountNumber(e.target.value)}
              startContent={<CreditCard size={18} className="text-default-400" />}
              description={selectedAccount ? `Доступный баланс: ${selectedAccount.balance.toLocaleString()} ${selectedAccount.currency}` : ''}
            >
              {accounts.map((acc) => (
                <SelectItem key={acc.accountNumber} value={acc.accountNumber} textValue={`${acc.accountNumber} (${acc.balance} ${acc.currency})`}>
                  <div className="flex justify-between items-center w-full">
                    <span className="font-mono text-sm">{acc.accountNumber}</span>
                    <span className="font-semibold">{acc.balance.toLocaleString()} {acc.currency}</span>
                  </div>
                </SelectItem>
              ))}
            </Select>

            <Input
              label="Номер счета получателя"
              placeholder="Введите 20-значный номер счета"
              variant="bordered"
              value={toAccountNumber}
              onValueChange={setToAccountNumber}
              startContent={<UserIcon className="text-default-400" size={18} />}
            />

            <Input
              label="Сумма"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              variant="bordered"
              value={amount}
              onValueChange={setAmount}
              startContent={<DollarSign className="text-default-400" size={18} />}
              isInvalid={selectedAccount !== undefined && parseFloat(amount) > selectedAccount.balance}
              errorMessage={selectedAccount !== undefined && parseFloat(amount) > selectedAccount.balance ? "Недостаточно средств" : ""}
            />

            <div className="flex gap-4 mt-4">
              <Button 
                variant="flat" 
                className="flex-1"
                onPress={() => navigate('/dashboard')}
              >
                Отмена
              </Button>
              <Button 
                color="primary" 
                type="submit" 
                className="flex-1"
                isLoading={isTransferring}
                isDisabled={!isFormValid}
                endContent={!isTransferring && <Send size={18} />}
              >
                Перевести
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

// Temp UserIcon for this file to avoid extra import lines
const UserIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
