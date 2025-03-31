<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Настройки системы</h1>

    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Основные настройки</h2>
      <form @submit.prevent="saveSettings">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="monitoringInterval" class="block text-sm font-medium text-gray-700 mb-1">
              Интервал мониторинга (минуты)
            </label>
            <input
              type="number"
              id="monitoringInterval"
              v-model="settings.monitoringInterval"
              min="1"
              class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500">
              Как часто система будет проверять цены товаров
            </p>
          </div>
          
          <div>
            <label for="priceUpdateInterval" class="block text-sm font-medium text-gray-700 mb-1">
              Интервал обновления цен (минуты)
            </label>
            <input
              type="number"
              id="priceUpdateInterval"
              v-model="settings.priceUpdateInterval"
              min="1"
              class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500">
              Как часто система будет обновлять цены товаров
            </p>
          </div>
          
          <div>
            <label for="frontPriceApiUrl" class="block text-sm font-medium text-gray-700 mb-1">
              URL API Front Price
            </label>
            <input
              type="text"
              id="frontPriceApiUrl"
              v-model="settings.frontPriceApiUrl"
              class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500">
              URL для доступа к API Front Price
            </p>
          </div>
          
          <div>
            <label for="minPriceThreshold" class="block text-sm font-medium text-gray-700 mb-1">
              Минимальный порог цены (%)
            </label>
            <input
              type="number"
              id="minPriceThreshold"
              v-model="settings.minPriceThreshold"
              min="1"
              max="100"
              class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500">
              Минимальное отклонение от МРПЦ в процентах
            </p>
          </div>
        </div>

        <div class="border-t border-gray-200 mt-8 pt-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">API Ozon</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="ozonClientId" class="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                type="text"
                id="ozonClientId"
                v-model="settings.ozonClientId"
                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p class="mt-1 text-sm text-gray-500">
                ID клиента для API Ozon
              </p>
            </div>
            
            <div>
              <label for="ozonApiKey" class="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div class="flex">
                <input
                  :type="showApiKey ? 'text' : 'password'"
                  id="ozonApiKey"
                  v-model="settings.ozonApiKey"
                  class="w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  @click="showApiKey = !showApiKey"
                  class="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  <svg v-if="showApiKey" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-sm text-gray-500">
                Ключ API для доступа к API Ozon
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 mt-8 pt-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Безопасность</h3>
          <div class="mb-4">
            <label for="secretKey" class="block text-sm font-medium text-gray-700 mb-1">
              Секретный ключ
            </label>
            <div class="flex">
              <input
                type="password"
                id="secretKey"
                v-model="settings.secretKey"
                disabled
                class="w-full border border-gray-300 rounded-l-md py-2 px-3 bg-gray-50 text-gray-500"
              />
              <button
                type="button"
                @click="generateNewSecretKey"
                class="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Сгенерировать новый ключ
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              Используется для шифрования данных и JWT токенов
            </p>
          </div>
        </div>

        <div class="border-t border-gray-200 mt-8 pt-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Режим работы</h3>
          <div class="mb-4">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="autoMode"
                v-model="settings.autoMode"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="autoMode" class="ml-2 block text-sm text-gray-900">
                Автоматический режим работы
              </label>
            </div>
            <p class="mt-1 text-sm text-gray-500 ml-6">
              Если включено, система будет автоматически обновлять цены. Если выключено, обновление цен будет происходить только по нажатию кнопок.
            </p>
          </div>
        </div>

        <div class="flex justify-end mt-8">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-3 hover:bg-gray-50"
            @click="resetSettings"
          >
            Отменить
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить настройки' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

const isSaving = ref(false);
const showApiKey = ref(false);

// Настройки системы
const settings = reactive({
  monitoringInterval: 30,
  priceUpdateInterval: 60,
  frontPriceApiUrl: 'https://api.frontprice.ru',
  minPriceThreshold: 5,
  ozonClientId: '',
  ozonApiKey: '',
  secretKey: '****************************************',
  autoMode: false
});

// Оригинальные настройки для возможности отмены изменений
let originalSettings = { ...settings };

// Получение настроек с сервера
const fetchSettings = async () => {
  try {
    // Здесь будет запрос к API для получения настроек
    // const response = await fetch('/api/settings');
    // const data = await response.json();
    // Object.assign(settings, data);
    
    // Сохраняем копию для возможности отмены изменений
    originalSettings = { ...settings };
  } catch (error) {
    console.error('Ошибка при загрузке настроек:', error);
  }
};

// Сохранение настроек
const saveSettings = async () => {
  isSaving.value = true;
  try {
    // Здесь будет запрос к API для сохранения настроек
    // await fetch('/api/settings', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(settings),
    // });
    
    // Обновляем оригинальные настройки
    originalSettings = { ...settings };
    alert('Настройки успешно сохранены');
  } catch (error) {
    console.error('Ошибка при сохранении настроек:', error);
    alert('Ошибка при сохранении настроек');
  } finally {
    isSaving.value = false;
  }
};

// Генерация нового секретного ключа
const generateNewSecretKey = async () => {
  const confirmed = confirm('Вы уверены, что хотите сгенерировать новый секретный ключ? Это приведет к выходу из системы всех пользователей.');
  if (confirmed) {
    try {
      // Здесь будет запрос к API для генерации нового ключа
      // const response = await fetch('/api/settings/generate-secret', {
      //   method: 'POST',
      // });
      // const data = await response.json();
      // settings.secretKey = data.secretKey;
      
      alert('Новый секретный ключ успешно сгенерирован');
    } catch (error) {
      console.error('Ошибка при генерации ключа:', error);
      alert('Ошибка при генерации ключа');
    }
  }
};

// Отмена изменений и возврат к последним сохраненным настройкам
const resetSettings = () => {
  Object.assign(settings, originalSettings);
};

// Загрузка настроек при монтировании компонента
onMounted(() => {
  fetchSettings();
});
</script> 