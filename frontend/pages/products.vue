<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Управление товарами</h1>
      <div class="flex space-x-4">
        <button @click="fetchProducts" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Получить/Обновить данные
        </button>
        <button @click="showBulkMrcModal = true" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Массовое добавление МРЦ
        </button>
        <button @click="stopAllProducts" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
          </svg>
          Остановить все
        </button>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div class="flex-grow md:mr-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input type="text" v-model="search" placeholder="Поиск товаров..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div class="w-full sm:w-40">
            <select v-model="filterStatus" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="monitoring">Мониторинг</option>
              <option value="updating">Обновление цен</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
          <div class="w-full sm:w-40">
            <select v-model="sortBy" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="name">По названию</option>
              <option value="price">По цене</option>
              <option value="date">По дате добавления</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Таблица товаров -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Товар
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Артикул
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Текущая цена
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                МРПЦ
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Последнее обновление
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in filteredProducts" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-md object-cover" :src="product.image" alt="" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ product.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ product.category }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ product.sku }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ product.currentPrice }} ₽</div>
                <div v-if="product.priceChange" :class="['text-xs', product.priceChange > 0 ? 'text-green-600' : 'text-red-600']">
                  {{ product.priceChange > 0 ? '+' : '' }}{{ product.priceChange }} ₽
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ product.recommendedPrice }} ₽</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  product.status === 'active' ? 'bg-green-100 text-green-800' :
                  product.status === 'monitoring' ? 'bg-blue-100 text-blue-800' :
                  product.status === 'updating' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ getStatusText(product.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ product.lastUpdate }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3">Детали</button>
                <button class="text-gray-600 hover:text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Показано <span class="font-medium">{{ filteredProducts.length }}</span> из <span class="font-medium">{{ products.length }}</span> товаров
          </div>
          <div class="flex-1 flex justify-center sm:justify-end">
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">Предыдущая</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-gray-50">
                1
              </a>
              <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </a>
              <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </a>
              <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">Следующая</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Модальное окно для массового добавления МРЦ -->
  <div v-if="showBulkMrcModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Массовое добавление МРЦ и скидок</h3>
        <button @click="showBulkMrcModal = false" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Вставьте данные в формате: SKU PRICE DISCOUNT
        </label>
        <textarea
          v-model="bulkMrcData"
          rows="10"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1772763094&#9;1400&#9;47&#10;1667595684&#9;1500&#9;47&#10;1666534105&#9;1900&#9;47"
        ></textarea>
      </div>
      <div class="flex justify-end space-x-4">
        <button
          @click="showBulkMrcModal = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="applyBulkMrc"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Применить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Фильтры и сортировка
const search = ref('');
const filterStatus = ref('');
const sortBy = ref('name');

// Состояние модального окна и данные
const showBulkMrcModal = ref(false);
const bulkMrcData = ref('');

// Моковые данные товаров
const products = ref([
  {
    id: 1,
    name: 'Смартфон Samsung Galaxy S21',
    category: 'Электроника',
    sku: 'SM-G991-256',
    image: 'https://via.placeholder.com/150',
    currentPrice: 69990,
    priceChange: -2000,
    recommendedPrice: 74990,
    status: 'active',
    lastUpdate: '12.08.2023, 15:30'
  },
  {
    id: 2,
    name: 'Ноутбук Lenovo IdeaPad 5',
    category: 'Компьютеры',
    sku: 'LE-IP5-14-8GB',
    image: 'https://via.placeholder.com/150',
    currentPrice: 54990,
    priceChange: 0,
    recommendedPrice: 54990,
    status: 'monitoring',
    lastUpdate: '11.08.2023, 18:45'
  },
  {
    id: 3,
    name: 'Кофемашина DeLonghi Magnifica S',
    category: 'Бытовая техника',
    sku: 'DL-ECAM-22',
    image: 'https://via.placeholder.com/150',
    currentPrice: 34990,
    priceChange: 1500,
    recommendedPrice: 32990,
    status: 'updating',
    lastUpdate: '12.08.2023, 10:15'
  },
  {
    id: 4,
    name: 'Наушники Sony WH-1000XM4',
    category: 'Аудиотехника',
    sku: 'SONY-WH1000XM4',
    image: 'https://via.placeholder.com/150',
    currentPrice: 27990,
    priceChange: -1000,
    recommendedPrice: 29990,
    status: 'active',
    lastUpdate: '10.08.2023, 12:00'
  },
  {
    id: 5,
    name: 'Пылесос Dyson V11',
    category: 'Бытовая техника',
    sku: 'DYSON-V11',
    image: 'https://via.placeholder.com/150',
    currentPrice: 49990,
    priceChange: 0,
    recommendedPrice: 49990,
    status: 'inactive',
    lastUpdate: '09.08.2023, 14:20'
  }
]);

// Фильтрация товаров
const filteredProducts = computed(() => {
  return products.value
    .filter(product => {
      // Фильтр по поиску
      const searchMatch = search.value === '' || 
        product.name.toLowerCase().includes(search.value.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.value.toLowerCase());
      
      // Фильтр по статусу
      const statusMatch = filterStatus.value === '' || product.status === filterStatus.value;
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      // Сортировка
      if (sortBy.value === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy.value === 'price') {
        return a.currentPrice - b.currentPrice;
      } else {
        // По дате (в данном случае используем id как прокси для даты)
        return b.id - a.id;
      }
    });
});

// Получение текстового представления статуса
function getStatusText(status: string): string {
  switch (status) {
    case 'active': return 'Активный';
    case 'monitoring': return 'Мониторинг';
    case 'updating': return 'Обновление цен';
    case 'inactive': return 'Неактивный';
    default: return 'Неизвестно';
  }
}

// Функции для работы с товарами
const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/products');
    const data = await response.json();
    products.value = data;
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    // TODO: Добавить уведомление об ошибке
  }
};

const stopAllProducts = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/products/stop-all', {
      method: 'POST'
    });
    if (response.ok) {
      // Обновляем статус всех товаров на "inactive"
      products.value = products.value.map(product => ({
        ...product,
        status: 'inactive'
      }));
      // TODO: Добавить уведомление об успехе
    }
  } catch (error) {
    console.error('Ошибка при остановке товаров:', error);
    // TODO: Добавить уведомление об ошибке
  }
};

const applyBulkMrc = async () => {
  try {
    // Парсим данные из текстового поля
    const lines = bulkMrcData.value.trim().split('\n');
    const mrcData = lines.map(line => {
      const [sku, price, discount] = line.split(/\s+/);
      return {
        sku,
        price: parseFloat(price),
        discount: parseInt(discount)
      };
    });

    // Отправляем данные на сервер
    const response = await fetch('http://localhost:8000/api/products/bulk-mrc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mrcData)
    });

    if (response.ok) {
      showBulkMrcModal.value = false;
      bulkMrcData.value = '';
      await fetchProducts(); // Обновляем список товаров
      // TODO: Добавить уведомление об успехе
    }
  } catch (error) {
    console.error('Ошибка при обновлении МРЦ:', error);
    // TODO: Добавить уведомление об ошибке
  }
};
</script> 