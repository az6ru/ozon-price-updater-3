import { defineStore } from 'pinia';
import { useApiStore } from './api';

interface User {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isSuperuser: (state) => state.user?.is_superuser || false,
  },

  actions: {
    async login(username: string, password: string) {
      this.isLoading = true;
      this.error = null;

      try {
        const apiStore = useApiStore();
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${apiStore.baseUrl}/api/auth/login`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Ошибка аутентификации');
        }
        
        this.token = data.access_token;
        
        // Получение информации о пользователе
        try {
          const userResponse = await fetch(`${apiStore.baseUrl}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            this.user = userData;
          } else {
            // Если не удалось получить информацию о пользователе, создаем базовый объект
            this.user = {
              id: 0,
              username: username,
              email: '',
              is_superuser: false
            };
          }
        } catch (error) {
          console.error('Ошибка при получении данных пользователя:', error);
          // Используем базовые данные пользователя
          this.user = {
            id: 0,
            username: username,
            email: '',
            is_superuser: false
          };
        }
        
        // Сохраняем данные в localStorage
        localStorage.setItem('auth_token', this.token);
        if (this.user) {
          localStorage.setItem('auth_user', JSON.stringify(this.user));
        }
        
        return true;
      } catch (error: any) {
        this.error = error.message || 'Неизвестная ошибка';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      // Можно добавить запрос к API для инвалидации токена
      try {
        const apiStore = useApiStore();
        if (this.token) {
          await fetch(`${apiStore.baseUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          });
        }
      } catch (error) {
        console.error('Ошибка при выходе из системы:', error);
      }
      
      this.token = null;
      this.user = null;
      
      // Удаляем данные из localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },

    async checkAuth() {
      // Проверяем наличие токена в localStorage
      const token = localStorage.getItem('auth_token');
      const userJson = localStorage.getItem('auth_user');
      
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          this.token = token;
          this.user = user;
          
          // Проверка валидности токена на сервере
          const apiStore = useApiStore();
          const response = await fetch(`${apiStore.baseUrl}/api/status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Токен недействителен');
          }
          
          return true;
        } catch (error) {
          console.error('Ошибка при проверке авторизации:', error);
          this.logout();
          return false;
        }
      }
      
      return false;
    }
  }
}); 