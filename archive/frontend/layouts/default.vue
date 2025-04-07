<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <NuxtLink to="/" class="text-xl font-bold text-blue-600">Ozon Price Updater</NuxtLink>
        </div>
        <nav class="hidden md:flex space-x-6">
          <NuxtLink to="/" class="text-gray-700 hover:text-blue-600 transition">Главная</NuxtLink>
          <NuxtLink to="/products" class="text-gray-700 hover:text-blue-600 transition">Товары</NuxtLink>
          <NuxtLink to="/price-history" class="text-gray-700 hover:text-blue-600 transition">История цен</NuxtLink>
          <NuxtLink to="/api-logs" class="text-gray-700 hover:text-blue-600 transition">Логи API</NuxtLink>
          <NuxtLink to="/settings" class="text-gray-700 hover:text-blue-600 transition">Настройки</NuxtLink>
        </nav>
        <div class="flex items-center space-x-4">
          <button class="p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition">
            <span class="sr-only">Аккаунт</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="flex-grow container mx-auto px-4 py-6">
      <slot />
    </main>

    <footer class="bg-white border-t border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <div class="text-center text-gray-500 text-sm">
          &copy; {{ new Date().getFullYear() }} Ozon Price Updater. Все права защищены.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Компонент основного макета
</script> 