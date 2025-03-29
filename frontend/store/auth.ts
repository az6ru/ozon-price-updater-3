import { defineStore } from 'pinia';

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
        // Здесь будет реальный запрос к API
        // const response = await fetch('/api/auth/login', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ username, password }),
        // });
        
        // const data = await response.json();
        
        // if (!response.ok) {
        //   throw new Error(data.detail || 'Ошибка аутентификации');
        // }
        
        // Моковые данные для тестирования
        const data = {
          access_token: 'mock_token_' + Date.now(),
          user: {
            id: 1,
            username,
            email: 'user@example.com',
            is_superuser: username === 'admin',
          }
        };

        this.token = data.access_token;
        this.user = data.user;
        
        // Сохраняем данные в localStorage
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
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
      // await fetch('/api/auth/logout', {...})
      
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
          
          // Здесь можно добавить проверку валидности токена на сервере
          // const response = await fetch('/api/auth/verify', {
          //   headers: {
          //     'Authorization': `Bearer ${token}`
          //   }
          // });
          
          // if (!response.ok) {
          //   throw new Error('Токен недействителен');
          // }
          
          return true;
        } catch (error) {
          this.logout();
          return false;
        }
      }
      
      return false;
    }
  }
}); 