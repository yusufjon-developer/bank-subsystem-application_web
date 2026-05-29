import React, { useState } from 'react';
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem } from '@nextui-org/react';
import { accountApi } from '../../api/accountApi';
import type { Account, Currency, AccountType } from '../../types';
import { ShieldCheck, Search, Plus, Ban, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../components/ui/ToastProvider';

export const OperatorAccountsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchedAccount, setSearchedAccount] = useState<Account | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newAccountData, setNewAccountData] = useState({ clientId: '', currency: 'TJS' as Currency, type: 'CHECKING' as AccountType });
  const [isCreating, setIsCreating] = useState(false);

  const { success, error } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchedAccount(null);
    try {
      const data = await accountApi.getAccountDetails(searchQuery.trim());
      setSearchedAccount(data);
    } catch (err) {
      console.error('Account not found', err);
      error('Счет не найден', 'Проверьте правильность ввода 20-значного номера счета.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBlockAccount = async (accountNumber: string) => {
    try {
      const updated = await accountApi.blockAccount(accountNumber);
      setSearchedAccount(updated);
      success('Счет заблокирован', `Счет ${accountNumber} успешно заблокирован.`);
    } catch (err: any) {
      console.error('Failed to block account', err);
      error('Ошибка операции', err.response?.data?.message || 'Не удалось заблокировать счет.');
    }
  };

  const handleCloseAccount = async (accountNumber: string) => {
    try {
      const updated = await accountApi.closeAccount(accountNumber);
      setSearchedAccount(updated);
      success('Счет закрыт', `Счет ${accountNumber} успешно закрыт.`);
    } catch (err: any) {
      console.error('Failed to close account', err);
      error('Ошибка операции', err.response?.data?.message || 'Не удалось закрыть счет.');
    }
  };

  const handleCreateAccount = async (onClose: () => void) => {
    try {
      setIsCreating(true);
      const newAcc = await accountApi.createAccount({
        clientId: parseInt(newAccountData.clientId),
        currency: newAccountData.currency,
        type: newAccountData.type
      });
      success('Счет открыт', `Успешно открыт счет ${newAcc.accountNumber} для клиента ${newAccountData.clientId}`);
      setSearchedAccount(newAcc);
      onClose();
      setNewAccountData({ clientId: '', currency: 'TJS', type: 'CHECKING' });
    } catch (err: any) {
      console.error('Failed to create account', err);
      error('Ошибка создания', err.response?.data?.message || 'Не удалось открыть новый счет.');
    } finally {
      setIsCreating(false);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'CHECKING': return 'Расчетный';
      case 'SAVINGS': return 'Сберегательный';
      case 'CURRENCY': return 'Валютный';
      default: return type;
    }
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isOperator = user?.role === 'ROLE_OPERATOR';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Операции по счетам</h1>
            <p className="text-default-500">Поиск сведений, открытие, блокировка или закрытие клиентских счетов</p>
          </div>
        </div>
        {(isOperator || isAdmin) && (
          <Button color="primary" onPress={onOpen} startContent={<Plus size={18} />}>
            Открыть новый счет
          </Button>
        )}
      </div>

      {/* Search Account Bar */}
      <Card className="shadow-soft">
        <CardBody className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Введите 20-значный номер счета для поиска..."
              startContent={<Search size={18} className="text-default-400" />}
              value={searchQuery}
              onValueChange={setSearchQuery}
              variant="bordered"
              className="flex-1"
            />
            <Button color="primary" type="submit" isLoading={isSearching}>
              Поиск
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Searched Account Results */}
      {searchedAccount ? (
        <Card className="shadow-soft">
          <CardBody className="p-0">
            <div className="p-6 border-b border-default-200">
              <h2 className="text-xl font-bold">Результат поиска</h2>
            </div>
            <Table aria-label="Accounts table" removeWrapper>
              <TableHeader>
                <TableColumn>НОМЕР СЧЕТА</TableColumn>
                <TableColumn>ТИП</TableColumn>
                <TableColumn>ВАЛЮТА</TableColumn>
                <TableColumn>БАЛАНС</TableColumn>
                <TableColumn>СТАТУС</TableColumn>
                <TableColumn align="center">ДЕЙСТВИЯ</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">{searchedAccount.accountNumber}</TableCell>
                  <TableCell>{getAccountTypeLabel(searchedAccount.type)}</TableCell>
                  <TableCell>{searchedAccount.currency}</TableCell>
                  <TableCell className="font-semibold">{searchedAccount.balance.toLocaleString()} {searchedAccount.currency}</TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      color={
                        searchedAccount.status === 'ACTIVE' ? 'success' : 
                        searchedAccount.status === 'BLOCKED' ? 'danger' : 'warning'
                      }
                    >
                      {searchedAccount.status === 'ACTIVE' ? 'Активен' : searchedAccount.status === 'BLOCKED' ? 'Блокирован' : 'Закрыт'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <div className="flex justify-center items-center gap-2">
                        {searchedAccount.status === 'ACTIVE' && (
                          <>
                            <Button 
                              size="sm" 
                              color="danger" 
                              variant="flat"
                              startContent={<Ban size={14} />}
                              onPress={() => handleBlockAccount(searchedAccount.accountNumber)}
                            >
                              Блокировать
                            </Button>
                            <Button 
                              size="sm" 
                              color="default" 
                              variant="flat"
                              onPress={() => handleCloseAccount(searchedAccount.accountNumber)}
                            >
                              Закрыть
                            </Button>
                          </>
                        )}
                        {searchedAccount.status !== 'ACTIVE' && (
                          <span className="text-xs text-default-400">Действия недоступны</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-default-400">Действия недоступны (Только для Админа)</span>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        !isSearching && (
          <div className="flex flex-col items-center justify-center min-h-[200px] border border-dashed border-default-300 rounded-2xl p-6 text-default-500">
            <AlertCircle size={32} className="mb-2 opacity-50" />
            <p>Используйте панель поиска выше для запроса сведений по конкретному счету</p>
          </div>
        )
      )}

      {/* Open Account Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Открытие нового счета</ModalHeader>
              <ModalBody>
                <Input
                  label="ID профиля клиента"
                  placeholder="Введите числовой ID клиента"
                  value={newAccountData.clientId}
                  onChange={(e) => setNewAccountData({ ...newAccountData, clientId: e.target.value })}
                  variant="bordered"
                  type="number"
                />
                <Select
                  label="Валюта"
                  selectedKeys={[newAccountData.currency]}
                  onChange={(e) => setNewAccountData({ ...newAccountData, currency: e.target.value as Currency })}
                  variant="bordered"
                >
                  <SelectItem key="TJS" value="TJS">TJS (Сомони)</SelectItem>
                  <SelectItem key="USD" value="USD">USD (Доллар США)</SelectItem>
                  <SelectItem key="EUR" value="EUR">EUR (Евро)</SelectItem>
                  <SelectItem key="RUB" value="RUB">RUB (Российский рубль)</SelectItem>
                </Select>
                <Select
                  label="Тип счета"
                  selectedKeys={[newAccountData.type]}
                  onChange={(e) => setNewAccountData({ ...newAccountData, type: e.target.value as AccountType })}
                  variant="bordered"
                >
                  <SelectItem key="CHECKING" value="CHECKING">Расчетный (Checking)</SelectItem>
                  <SelectItem key="SAVINGS" value="SAVINGS">Сберегательный (Savings)</SelectItem>
                  <SelectItem key="CURRENCY" value="CURRENCY">Валютный (Currency)</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Отмена
                </Button>
                <Button color="primary" onPress={() => handleCreateAccount(onClose)} isLoading={isCreating}>
                  Открыть счет
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
