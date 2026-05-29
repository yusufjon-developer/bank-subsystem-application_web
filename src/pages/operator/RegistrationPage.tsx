import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button } from '@nextui-org/react';
import { authApi } from '../../api/authApi';
import { useToast } from '../../components/ui/ToastProvider';
import { UserPlus } from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    passportSeries: '',
    passportNumber: '',
    phone: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await authApi.registerClient({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        passportSeries: formData.passportSeries,
        passportNumber: formData.passportNumber,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
      });
      success('Успешно', 'Клиент успешно зарегистрирован!');
      setFormData({
        username: '',
        password: '',
        fullName: '',
        passportSeries: '',
        passportNumber: '',
        phone: '',
        email: '',
      });
    } catch (error) {
      console.error(error);
      toastError('Ошибка', 'Не удалось зарегистрировать клиента.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <UserPlus className="text-primary" size={32} />
        <h1 className="text-3xl font-bold text-foreground">Регистрация клиента</h1>
      </div>
      
      <Card>
        <CardHeader className="px-6 pt-6 pb-0">
          <p className="font-semibold text-foreground">Персональные данные</p>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="ФИО клиента"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              isRequired
              variant="bordered"
              placeholder="Иванов Иван Иванович"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Серия паспорта"
                name="passportSeries"
                value={formData.passportSeries}
                onChange={handleChange}
                isRequired
                variant="bordered"
                placeholder="Например, 1234"
              />
              <Input
                label="Номер паспорта"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                isRequired
                variant="bordered"
                placeholder="Например, 567890"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Номер телефона"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="bordered"
                placeholder="+992..."
              />
              <Input
                label="Электронная почта"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="bordered"
                placeholder="client@mail.ru"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Имя пользователя (Логин)"
                name="username"
                value={formData.username}
                onChange={handleChange}
                isRequired
                variant="bordered"
              />
              <Input
                label="Пароль"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                isRequired
                variant="bordered"
              />
            </div>
            
            <Button 
              color="primary" 
              type="submit" 
              className="mt-4"
              isLoading={isLoading}
              size="lg"
            >
              Зарегистрировать клиента
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
