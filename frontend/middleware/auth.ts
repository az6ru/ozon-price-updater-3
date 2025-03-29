import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  
  // Проверяем авторизацию
  const isAuthenticated = await authStore.checkAuth()
  
  // Если путь требует только суперпользователя и пользователь не суперпользователь
  if (to.meta.requiresSuperuser && !authStore.isSuperuser) {
    return navigateTo('/forbidden')
  }
  
  // Если путь требует авторизации и пользователь не авторизован
  if (to.meta.requiresAuth && !isAuthenticated) {
    return navigateTo('/login')
  }
  
  // Если пользователь уже авторизован и пытается перейти на страницу логина
  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
}) 