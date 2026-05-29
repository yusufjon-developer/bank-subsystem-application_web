import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Select, SelectItem } from '@nextui-org/react';
import { transactionApi } from '../../api/transactionApi';
import { useToast } from '../../components/ui/ToastProvider';
import { Landmark } from 'lucide-react';

export const CashDeskPage: React.FC = () => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
    type: 'DEPOSIT' as 'DEPOSIT' | 'WITHDRAWAL',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, type: e.target.value as 'DEPOSIT' | 'WITHDRAWAL' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await transactionApi.cashOperation({
        accountNumber: formData.accountNumber,
        amount: parseFloat(formData.amount),
        type: formData.type,
      });
      success('Успешно', 'Кассовая операция успешно проведена!');
      setFormData({ accountNumber: '', amount: '', type: 'DEPOSIT' });
    } catch (error) {
      console.error(error);
      toastError('Ошибка кассы', 'Не удалось выполнить кассовую операцию.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Landmark className="text-primary" size={32} />
        <h1 className="text-3xl font-bold text-foreground">Кассовые операции</h1>
      </div>
      
      <Card className="shadow-soft">
        <CardHeader className="px-6 pt-6 pb-0">
          <p className="font-semibold text-foreground">Проведение приходно-расходного ордера</p>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Номер счета клиента"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              isRequired
              variant="bordered"
              description="Например: 40817810356789012345"
            />
            <div className="flex flex-col md:flex-row gap-4">
              <Select
                label="Тип операции"
                name="type"
                selectedKeys={[formData.type]}
                onChange={handleSelectChange}
                className="flex-1"
                variant="bordered"
              >
                <SelectItem key="DEPOSIT" textValue="Внесение наличных">Внесение наличных (DEPOSIT)</SelectItem>
                <SelectItem key="WITHDRAWAL" textValue="Снятие наличных">Снятие наличных (WITHDRAWAL)</SelectItem>
              </Select>
              <Input
                label="Сумма операции"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                isRequired
                variant="bordered"
                className="flex-1"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <Button 
              color="primary" 
              type="submit" 
              className="mt-4"
              isLoading={isLoading}
              size="lg"
            >
              Провести операцию
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
