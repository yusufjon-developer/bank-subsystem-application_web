import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Home, CreditCard, Send, BarChart2, DollarSign, UserPlus, Users, Activity, Settings } from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: SidebarItem[] = [
  { name: 'Главная', path: '/dashboard', icon: <Home size={20} />, roles: ['ROLE_CLIENT', 'ROLE_OPERATOR', 'ROLE_ADMIN'] },
  { name: 'Мои счета', path: '/accounts', icon: <CreditCard size={20} />, roles: ['ROLE_CLIENT'] },
  { name: 'Переводы', path: '/transfer', icon: <Send size={20} />, roles: ['ROLE_CLIENT'] },
  { name: 'Аналитика', path: '/analytics', icon: <BarChart2 size={20} />, roles: ['ROLE_CLIENT', 'ROLE_ADMIN'] },
  { name: 'Касса банка', path: '/cash', icon: <DollarSign size={20} />, roles: ['ROLE_OPERATOR'] },
  { name: 'Регистрация клиента', path: '/register-client', icon: <UserPlus size={20} />, roles: ['ROLE_OPERATOR'] },
  { name: 'Пользователи', path: '/admin/users', icon: <Users size={20} />, roles: ['ROLE_ADMIN'] }, // Только ADMIN
  { name: 'Счета клиентов', path: '/admin/accounts', icon: <CreditCard size={20} />, roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] },
  { name: 'Курсы валют', path: '/exchange-rates', icon: <Activity size={20} />, roles: ['ROLE_CLIENT', 'ROLE_OPERATOR', 'ROLE_ADMIN'] },
  { name: 'Настройки', path: '/settings', icon: <Settings size={20} />, roles: ['ROLE_CLIENT', 'ROLE_OPERATOR', 'ROLE_ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const filteredItems = useMemo(() => {
    if (!user) return [];
    return navItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  return (
    <aside className="w-64 h-[calc(100vh-64px)] bg-transparent p-4 flex flex-col gap-2">
      <div className="flex flex-col gap-1 mt-4">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-full transition-colors font-medium text-sm ${
                isActive
                  ? 'bg-secondary text-primary'
                  : 'text-foreground hover:bg-default-100'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};
