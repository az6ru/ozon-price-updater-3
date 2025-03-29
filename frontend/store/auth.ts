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
        const response = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Ошибка аутентификации');
        }

        this.token = data.access_token;
        this.user = data.user;
        
        // Сохраняем данные в localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return true;
      } catch (error: any) {
        this.error = error.message || 'Неизвестная ошибка';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch('http://localhost:8000/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (error) {
        console.error('Ошибка при выходе:', error);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },

    async checkAuth() {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      
      if (token && userJson) {
        try {
          const response = await fetch('http://localhost:8000/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Токен недействителен');
          }

          const user = JSON.parse(userJson);
          this.token = token;
          this.user = user;
          
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