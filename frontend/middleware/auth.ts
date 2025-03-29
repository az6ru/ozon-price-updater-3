import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '@/store/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const publicRoutes = ['/login']
  
  // Проверяем токен при каждом переходе
  if (!authStore.token) {
    // Если нет токена и это не публичный маршрут - редирект на логин
    if (!publicRoutes.includes(to.path)) {
      return navigateTo('/login')
    }
  } else {
    // Если есть токен и пользователь пытается зайти на страницу логина - редирект на главную
    if (publicRoutes.includes(to.path)) {
      return navigateTo('/')
    }
    
    // Проверяем валидность токена
    try {
      await authStore.checkAuth()
    } catch (error) {
      // Если токен невалидный - очищаем и редирект на логин
      authStore.logout()
      return navigateTo('/login')
    }
  }
  
  // Если путь требует только суперпользователя и пользователь не суперпользователь
  if (to.meta.requiresSuperuser && !authStore.isSuperuser) {
    return navigateTo('/forbidden')
  }
}) 