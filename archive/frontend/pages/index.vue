<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Панель управления</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Статистика товаров -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-700">Товары</h2>
          <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Активные</span>
        </div>
        <div class="flex items-baseline space-x-2">
          <span class="text-3xl font-bold">{{ productStats.total }}</span>
          <span class="text-sm text-gray-500">всего</span>
        </div>
        <div class="mt-4 flex justify-between text-sm">
          <div>
            <div class="text-green-600 font-medium">{{ productStats.monitored }}</div>
            <div class="text-gray-500">Мониторинг</div>
          </div>
          <div>
            <div class="text-yellow-600 font-medium">{{ productStats.priceUpdated }}</div>
            <div class="text-gray-500">Обновление цен</div>
          </div>
          <div>
            <div class="text-red-600 font-medium">{{ productStats.inactive }}</div>
            <div class="text-gray-500">Неактивные</div>
          </div>
        </div>
      </div>

      <!-- Статистика цен -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-700">Цены</h2>
          <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">За 24 часа</span>
        </div>
        <div class="flex items-baseline space-x-2">
          <span class="text-3xl font-bold">{{ priceStats.updatedToday }}</span>
          <span class="text-sm text-gray-500">обновлено</span>
        </div>
        <div class="mt-4 flex justify-between text-sm">
          <div>
            <div class="text-green-600 font-medium">{{ priceStats.increased }}</div>
            <div class="text-gray-500">Повышение</div>
          </div>
          <div>
            <div class="text-blue-600 font-medium">{{ priceStats.decreased }}</div>
            <div class="text-gray-500">Понижение</div>
          </div>
          <div>
            <div class="text-gray-600 font-medium">{{ priceStats.unchanged }}</div>
            <div class="text-gray-500">Без изменений</div>
          </div>
        </div>
      </div>

      <!-- Система -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-700">Система</h2>
          <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Статус</span>
        </div>
        <div class="flex items-baseline space-x-2">
          <span class="text-3xl font-bold text-green-600">Активна</span>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-500">Мониторинг:</div>
            <div class="font-medium">{{ system.monitoringInterval }} мин.</div>
          </div>
          <div>
            <div class="text-gray-500">Обновление цен:</div>
            <div class="font-medium">{{ system.priceUpdateInterval }} мин.</div>
          </div>
          <div>
            <div class="text-gray-500">Последний запуск:</div>
            <div class="font-medium">{{ system.lastRunTime }}</div>
          </div>
          <div>
            <div class="text-gray-500">Версия API:</div>
            <div class="font-medium">{{ system.apiVersion }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Графики -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- График обновления цен -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">Обновления цен (последние 7 дней)</h2>
        <div class="h-64">
          <!-- Здесь будет график -->
          <div class="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
            <span class="text-gray-500">График обновления цен</span>
          </div>
        </div>
      </div>

      <!-- График история цен -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">Активность API (последние 7 дней)</h2>
        <div class="h-64">
          <!-- Здесь будет график -->
          <div class="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
            <span class="text-gray-500">График активности API</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Моковые данные для отображения на дашборде
const productStats = reactive({
  total: 243,
  monitored: 185,
  priceUpdated: 142,
  inactive: 16
});

const priceStats = reactive({
  updatedToday: 78,
  increased: 32,
  decreased: 41,
  unchanged: 5
});

const system = reactive({
  monitoringInterval: 30,
  priceUpdateInterval: 60,
  lastRunTime: '19:30',
  apiVersion: 'v1.0.0'
});

// В реальном приложении здесь будут запросы к API для получения данных
onMounted(() => {
  // fetchDashboardData()
});
</script> 