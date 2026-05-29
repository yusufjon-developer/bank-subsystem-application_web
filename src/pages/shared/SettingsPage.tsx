import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Switch, Chip, Divider } from '@nextui-org/react';
import { useAuthStore } from '../../store/useAuthStore';
import { Settings, User as UserIcon, Shield, Laptop, Moon, Sun, Info } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Администратор';
      case 'ROLE_OPERATOR': return 'Операционист';
      case 'ROLE_CLIENT': return 'Клиент';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'danger';
      case 'ROLE_OPERATOR': return 'warning';
      case 'ROLE_CLIENT': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
          <p className="text-default-500">Управление интерфейсом и параметры безопасности вашей учетной записи</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Profile details */}
        <div className="col-span-1 flex flex-col gap-6">
          <Card className="shadow-soft">
            <CardHeader className="flex gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <UserIcon size={20} />
              </div>
              <h2 className="text-xl font-bold">Профиль пользователя</h2>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-default-400">Имя пользователя</span>
                <span className="font-semibold text-foreground text-sm">{user?.username}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-default-400">Роль в системе</span>
                <div>
                  <Chip color={getRoleColor(user?.role || '')} size="sm" variant="flat">
                    {getRoleLabel(user?.role || '')}
                  </Chip>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-default-400">Статус учетной записи</span>
                <div>
                  <Chip color="success" size="sm" variant="dot">
                    Активен
                  </Chip>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-default-400">Дата регистрации в системе</span>
                <span className="text-sm text-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Неизвестно'}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right column: UI personalization and security settings */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          {/* Theme card */}
          <Card className="shadow-soft">
            <CardHeader className="flex gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Laptop size={20} />
              </div>
              <h2 className="text-xl font-bold">Персонализация интерфейса</h2>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">Тёмная тема</span>
                  <span className="text-xs text-default-400">Включение тёмного режима оформления для комфортной работы в ночное время</span>
                </div>
                <Switch
                  isSelected={isDark}
                  onValueChange={toggleTheme}
                  color="primary"
                  size="lg"
                  startContent={<Moon size={16} />}
                  endContent={<Sun size={16} />}
                />
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-default-50 rounded-xl">
                <Info className="text-primary mt-0.5 flex-shrink-0" size={18} />
                <p className="text-xs text-default-500 leading-relaxed">
                  Цветовая схема приложения адаптирована под дизайн-систему <strong>Material 3 Emerald Theme</strong> с использованием мягких зелёных оттенков, снижающих усталость глаз.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Security and Session Card */}
          <Card className="shadow-soft">
            <CardHeader className="flex gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-bold">Параметры безопасности сеанса</h2>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-default-400">Адрес сервера бизнес-логики</span>
                  <span className="text-sm font-mono text-foreground">http://localhost:8080/api/v1</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-default-400">Тип токена авторизации</span>
                  <span className="text-sm font-mono text-foreground">Bearer JWT (HMAC-SHA256)</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-default-400">Время жизни Access Token</span>
                  <span className="text-sm text-foreground">15 минут (с автоматической ротацией по Refresh Token)</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-default-400">Протокол push-уведомлений</span>
                  <span className="text-sm text-foreground">WebSockets / STOMP (атомарная подписка)</span>
                </div>
              </div>
              
              <Divider className="my-2" />
              
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground">Рекомендации по безопасности:</p>
                <ul className="list-disc list-inside text-xs text-default-500 flex flex-col gap-1">
                  <li>Никогда не передавайте пароль и JWT-токены третьим лицам.</li>
                  <li>Все сеансы связи шифруются с использованием цифровой подписи.</li>
                  <li>После завершения работы с системой на публичном устройстве всегда нажимайте кнопку "Выйти".</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
