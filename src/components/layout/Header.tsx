import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar } from '@nextui-org/react';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Администратор';
      case 'ROLE_OPERATOR': return 'Операционист';
      case 'ROLE_CLIENT': return 'Клиент';
      default: return role;
    }
  };

  return (
    <Navbar className="bg-background">
      <NavbarBrand>
        <p className="font-bold text-inherit text-xl text-primary">BankSystem</p>
      </NavbarBrand>

      <NavbarContent as="div" justify="end">
        {user && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user.username}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Действия с профилем" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2" textValue="Информация о профиле">
                <p className="font-semibold text-xs text-default-400">Вы вошли как</p>
                <p className="font-bold text-foreground text-sm">{user.username}</p>
                <p className="text-xs text-primary font-medium mt-0.5">{getRoleLabel(user.role)}</p>
              </DropdownItem>
              <DropdownItem 
                key="settings" 
                textValue="Настройки"
                onClick={() => navigate('/settings')}
                startContent={<Settings size={16} />}
              >
                Настройки
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                onClick={handleLogout}
                startContent={<LogOut size={16} />}
                textValue="Выйти из системы"
              >
                Выйти из системы
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>
    </Navbar>
  );
};
