import { useApiStore } from '../store/api';
import { computed } from 'vue';

export function useApi() {
  const apiStore = useApiStore();

  const api = {
    /**
     * Получить список товаров с пагинацией
     */
    async getProducts(page = 1, limit = 20, query = '') {
      return apiStore.get(`api/products`, { page, limit, query });
    },

    /**
     * Получить детальную информацию о товаре
     */
    async getProduct(id: string) {
      return apiStore.get(`api/products/${id}`);
    },

    /**
     * Установить МРЦ для товара
     */
    async setMrpc(sku: string, mrpc: number) {
      return apiStore.post(`api/products/set-mrpc`, { sku, mrpc });
    },

    /**
     * Установить скидку для товара
     */
    async setDiscount(sku: string, discount: number) {
      return apiStore.post(`api/products/set-discount`, { sku, discount });
    },

    /**
     * Активировать мониторинг товара
     */
    async activateProduct(productId: string) {
      return apiStore.post(`api/products/${productId}/activate`, {});
    },

    /**
     * Деактивировать мониторинг товара
     */
    async deactivateProduct(productId: string) {
      return apiStore.post(`api/products/${productId}/deactivate`, {});
    },

    /**
     * Получить историю изменения цен
     */
    async getPriceHistory(params = { page: 1, limit: 20 }) {
      return apiStore.get(`api/price-history`, params);
    },

    /**
     * Получить журнал API запросов
     */
    async getApiLogs(params = { page: 1, limit: 20 }) {
      return apiStore.get(`api/api-logs`, params);
    },

    /**
     * Получить настройки системы
     */
    async getSettings() {
      return apiStore.get(`api/settings`);
    },

    /**
     * Обновить настройки системы
     */
    async updateSettings(settings: any) {
      return apiStore.post(`api/settings`, settings);
    },

    /**
     * Запустить обновление цен вручную
     */
    async updatePrices(productIds?: string[]) {
      return apiStore.post(`api/products/update-prices`, { product_ids: productIds });
    },

    /**
     * Получить данные с витрины
     */
    async fetchFrontPrices() {
      return apiStore.post(`api/products/fetch-prices`, {});
    },

    /**
     * Получить данные о товарах из Ozon API
     */
    async fetchProductsFromOzon() {
      return apiStore.post(`api/products/fetch`, {});
    }
  };

  return {
    ...api,
    isLoading: computed(() => apiStore.isLoading),
    error: computed(() => apiStore.error)
  };
} 