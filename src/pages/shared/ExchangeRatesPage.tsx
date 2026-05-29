import React, { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { rateApi, type ExchangeRate } from '../../api/rateApi';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../components/ui/ToastProvider';
import { TrendingUp, Edit2 } from 'lucide-react';

export const ExchangeRatesPage: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [newRateValue, setNewRateValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setIsLoading(true);
      const data = await rateApi.getRates();
      setRates(data);
    } catch (err) {
      console.error('Failed to load rates', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (rate: ExchangeRate) => {
    setEditingRate(rate);
    setNewRateValue(rate.rate.toString());
    onOpen();
  };

  const handleUpdateRate = async (onClose: () => void) => {
    if (!editingRate) return;
    try {
      setIsUpdating(true);
      await rateApi.updateRate({
        fromCurrency: editingRate.fromCurrency,
        toCurrency: editingRate.toCurrency,
        rate: parseFloat(newRateValue),
      });
      success('Курс обновлен', 'Обменный курс успешно изменен.');
      fetchRates();
      onClose();
    } catch (err) {
      console.error('Failed to update rate', err);
      toastError('Ошибка обновления', 'Не удалось изменить курс валют.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <TrendingUp size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Курсы валют</h1>
          <p className="text-default-500">Текущие обменные курсы валют в системе</p>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <Table aria-label="Таблица курсов валют" removeWrapper>
            <TableHeader>
              <TableColumn>ИСХОДНАЯ ВАЛЮТА</TableColumn>
              <TableColumn>ЦЕЛЕВАЯ ВАЛЮТА</TableColumn>
              <TableColumn>КУРС ОБМЕНА</TableColumn>
              <TableColumn align="end">{isAdmin ? 'ДЕЙСТВИЯ' : ''}</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Курсы валют не найдены.">
              {rates.map((rate) => (
                <TableRow key={`${rate.fromCurrency}-${rate.toCurrency}`}>
                  <TableCell className="font-bold text-sm">{rate.fromCurrency}</TableCell>
                  <TableCell className="font-bold text-sm">{rate.toCurrency}</TableCell>
                  <TableCell className="text-lg font-semibold">{rate.rate}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      {isAdmin && (
                        <Button 
                          isIconOnly 
                          color="primary" 
                          variant="light" 
                          onPress={() => handleEditClick(rate)}
                          aria-label="Редактировать курс"
                        >
                          <Edit2 size={18} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Обновление курса валют</ModalHeader>
              <ModalBody>
                <div className="flex gap-4 items-center mb-4 text-xl">
                  <span className="font-bold">{editingRate?.fromCurrency}</span>
                  <span className="text-default-400">→</span>
                  <span className="font-bold">{editingRate?.toCurrency}</span>
                </div>
                <Input
                  label="Новый курс"
                  placeholder="Введите новый курс"
                  value={newRateValue}
                  onChange={(e) => setNewRateValue(e.target.value)}
                  variant="bordered"
                  type="number"
                  step="0.0001"
                  min="0.000001"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Отмена
                </Button>
                <Button color="primary" onPress={() => handleUpdateRate(onClose)} isLoading={isUpdating}>
                  Сохранить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
