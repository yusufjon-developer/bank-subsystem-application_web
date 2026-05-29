import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, Divider } from '@nextui-org/react';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/authApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User as UserIcon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isFormValid = useMemo(() => username.trim() !== '' && password.trim() !== '', [username, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isFormValid) return;
    
    setIsLoading(true);
    try {
      const response = await authApi.login({ username, password });
      
      const user = {
        id: response.userId,
        username: username,
        role: response.role,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setAuth(response.accessToken, response.refreshToken, user);
      
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login failed', err);
      setError('Неверное имя пользователя или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="flex flex-col gap-1 items-center pb-0 pt-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Личный кабинет</h1>
          <p className="text-default-500 text-sm">Пожалуйста, авторизуйтесь для входа</p>
        </CardHeader>
        
        <Divider className="my-4" />
        
        <CardBody>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              autoFocus
              label="Имя пользователя"
              placeholder="Введите имя пользователя"
              variant="bordered"
              value={username}
              onValueChange={setUsername}
              startContent={<UserIcon className="text-default-400" size={18} />}
            />
            <Input
              label="Пароль"
              placeholder="Введите пароль"
              type="password"
              variant="bordered"
              value={password}
              onValueChange={setPassword}
              startContent={<Lock className="text-default-400" size={18} />}
            />
            
            {error && <p className="text-danger text-sm">{error}</p>}
            
            <Button 
              color="primary" 
              type="submit" 
              isLoading={isLoading} 
              isDisabled={!isFormValid}
              className="mt-2"
            >
              Войти
            </Button>
          </form>
        </CardBody>
        <CardFooter className="flex justify-center pt-0 pb-6">
          <p className="text-sm text-default-500">
            Нет учетной записи? <span className="text-primary cursor-pointer hover:underline">Обратитесь в техподдержку</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
