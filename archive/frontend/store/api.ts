import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { useRuntimeConfig } from '#app';

interface ApiState {
  baseUrl: string;
  isLoading: boolean;
  error: string | null;
}

export const useApiStore = defineStore('api', {
  state: (): ApiState => {
    const config = useRuntimeConfig();
    return {
      baseUrl: config.public.apiBaseUrl || 'http://localhost:8000',
      isLoading: false,
      error: null,
    };
  },

  actions: {
    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
      const authStore = useAuthStore();
      
      const headers = new Headers(options.headers);
      
      // Добавляем токен авторизации, если пользователь аутентифицирован
      if (authStore.isAuthenticated && authStore.token) {
        headers.set('Authorization', `Bearer ${authStore.token}`);
      }
      
      // Устанавливаем Content-Type, если его нет, но есть тело запроса
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }
      
      const config: RequestInit = {
        ...options,
        headers,
      };
      
      // Подготавливаем URL
      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await fetch(url, config);
        
        // Если ответ не в формате JSON, возвращаем текст
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') === -1) {
          const text = await response.text();
          return text as unknown as T;
        }
        
        // Парсим JSON
        const data = await response.json();
        
        // Проверяем статус ответа
        if (!response.ok) {
          const error = data.detail || data.message || 'Ошибка API';
          throw new Error(error);
        }
        
        return data as T;
      } catch (error: any) {
        this.error = error.message || 'Неизвестная ошибка API';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Хелперы для разных типов запросов
    async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
      // Преобразуем параметры в строку запроса
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      
      return this.request<T>(url, { method: 'GET' });
    },
    
    async post<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    async put<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    
    async patch<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    
    async delete<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, { method: 'DELETE' });
    },
  },
}); 