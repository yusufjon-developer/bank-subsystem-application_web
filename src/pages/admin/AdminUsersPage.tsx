import React, { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { adminApi } from '../../api/adminApi';
import type { User } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, MoreVertical, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { success, error } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async (userId: number) => {
    try {
      await adminApi.blockUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: false } : u));
      success('Пользователь заблокирован', 'Учетная запись успешно деактивирована.');
    } catch (err) {
      console.error('Failed to block user', err);
      error('Ошибка действия', 'Не удалось заблокировать пользователя.');
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      await adminApi.unblockUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: true } : u));
      success('Пользователь разблокирован', 'Учетная запись успешно активирована.');
    } catch (err) {
      console.error('Failed to unblock user', err);
      error('Ошибка действия', 'Не удалось разблокировать пользователя.');
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Администратор';
      case 'ROLE_OPERATOR': return 'Операционист';
      case 'ROLE_CLIENT': return 'Клиент';
      default: return role;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Spinner size="lg" /></div>;
  }

  const isAdmin = currentUser?.role === 'ROLE_ADMIN';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Управление пользователями</h1>
          <p className="text-default-500">Управление профилями, блокировка и разблокировка пользователей системы</p>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardBody className="p-0">
          <Table aria-label="Users management table" removeWrapper>
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>ЛОГИН</TableColumn>
              <TableColumn>РОЛЬ</TableColumn>
              <TableColumn>СТАТУС</TableColumn>
              <TableColumn align="center">ДЕЙСТВИЯ</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Пользователи не найдены.">
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                  <TableCell className="font-semibold">{user.username}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color={getRoleColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="dot"
                      color={user.isActive ? 'success' : 'danger'}
                      startContent={user.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    >
                      {user.isActive ? 'Активен' : 'Заблокирован'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center">
                      {isAdmin && user.id !== currentUser?.id ? (
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly variant="light" size="sm">
                              <MoreVertical size={18} className="text-default-500" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu 
                            aria-label="User actions" 
                            onAction={(key) => {
                              if (key === 'block') handleBlockUser(user.id);
                              if (key === 'unblock') handleUnblockUser(user.id);
                            }}
                          >
                            {user.isActive ? (
                              <DropdownItem key="block" className="text-danger" color="danger">
                                Заблокировать
                              </DropdownItem>
                            ) : (
                              <DropdownItem key="unblock" className="text-success" color="success">
                                Разблокировать
                              </DropdownItem>
                            )}
                          </DropdownMenu>
                        </Dropdown>
                      ) : (
                        <Button isIconOnly variant="light" size="sm" isDisabled>
                          <ShieldAlert size={16} className="text-default-300" />
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
    </div>
  );
};
