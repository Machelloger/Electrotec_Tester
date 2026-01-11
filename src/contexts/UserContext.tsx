import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  fullName: string;
  group: string;
  course: number;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // Пытаемся загрузить пользователя из localStorage при инициализации
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Функция для установки пользователя (сохраняет в localStorage)
  const setCurrentUser = (user: User | null) => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
    setCurrentUserState(user);
  };

  // Функция выхода
  const logout = () => {
    setCurrentUser(null);
  };

  // Очистка при закрытии вкладки/окна (опционально)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Можно очистить здесь, но обычно оставляем в localStorage
      // localStorage.removeItem('currentUser');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const value: UserContextType = {
    currentUser,
    setCurrentUser,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};